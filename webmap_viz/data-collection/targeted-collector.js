// Targeted Collector - Daily Ritual 스타일 프롬프트로 소셜 미디어 데이터 수집 + 젠모지 생성

import { ApifyClient } from 'apify-client';
import { RitualPromptGenerator } from './enhanced-keyword-system.js';
import GenmojiGenerator from './genmoji-generator.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Apify client
const client = new ApifyClient({
    token: process.env.APIFY_API_KEY
});

// NYC 주요 이벤트
const NYC_EVENTS = {
    '2024-04-05': {
        event: 'NYC Earthquake',
        description: '4.8 Magnitude Earthquake',
        context: { event: 'earthquake', mood: 'shock' }
    },
    '2024-04-08': {
        event: 'Total Solar Eclipse',
        description: 'Solar Eclipse visible from NYC',
        context: { event: 'eclipse', mood: 'wonder' }
    },
    '2024-05-30': {
        event: 'Trump Conviction',
        description: 'Historic Manhattan Court Verdict',
        context: { event: 'conviction', mood: 'tension' }
    },
    '2024-11-05': {
        event: 'Election Day',
        description: 'Presidential Election',
        context: { event: 'election', mood: 'anticipation' }
    },
    '2024-12-09': {
        event: 'First Snow',
        description: 'First Snowfall of Winter',
        context: { event: 'snow', mood: 'transformation' }
    }
};

/**
 * Instagram 데이터 수집 (사진 필수)
 */
async function collectInstagram(keywords, limit = 50) {
    console.log(`    📸 Instagram: searching...`);
    
    try {
        const run = await client.actor("shu8hvrXbJbY3Eb9W").call({
            hashtags: keywords,
            resultsType: 'posts',
            resultsLimit: limit,
            addParentData: true
        });
        
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        // 사진 있는 것만 필터링
        const photoPosts = items.filter(item => item.displayUrl || item.thumbnailUrl);
        
        const results = photoPosts.map(item => ({
            platform: 'instagram',
            timestamp: item.timestamp,
            text: item.caption || '',
            imageUrl: item.displayUrl || item.thumbnailUrl,
            imageThumbnail: item.thumbnailUrl || item.displayUrl,
            hashtags: item.hashtags || [],
            location: item.locationName || 'NYC',
            lat: item.locationLat || 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: item.locationLng || -74.0060 + (Math.random() - 0.5) * 0.1,
            engagement: (item.likesCount || 0) + (item.commentsCount || 0)
        }));
        
        console.log(`      ✓ Found ${results.length} photo posts`);
        return results;
        
    } catch (error) {
        console.error(`      ✗ Instagram error: ${error.message}`);
        return [];
    }
}

/**
 * TikTok 데이터 수집 (썸네일 필수)
 */
async function collectTikTok(keywords, limit = 30) {
    console.log(`    🎵 TikTok: searching...`);
    
    try {
        const run = await client.actor("clockworks/tiktok-scraper").call({
            hashtags: keywords.map(k => `#${k}`),
            resultsPerPage: limit
        });
        
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        // 썸네일 있는 것만
        const videosWithThumbnails = items.filter(item => item.covers?.default);
        
        const results = videosWithThumbnails.map(item => ({
            platform: 'tiktok',
            timestamp: item.createTime ? new Date(item.createTime * 1000).toISOString() : new Date().toISOString(),
            text: item.text || '',
            imageUrl: item.covers?.default,
            imageThumbnail: item.covers?.default,
            hashtags: item.hashtags || [],
            location: 'NYC',
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            engagement: (item.diggCount || 0) + (item.shareCount || 0)
        }));
        
        console.log(`      ✓ Found ${results.length} videos with thumbnails`);
        return results;
        
    } catch (error) {
        console.error(`      ✗ TikTok error: ${error.message}`);
        return [];
    }
}

/**
 * 메인 수집 함수 (젠모지 생성 포함)
 */
async function collectForEvent(date, eventData) {
    console.log(`\n📅 ${date}: ${eventData.event}`);

    // 프롬프트 생성기
    const promptGen = new RitualPromptGenerator();

    // 컨텍스트 구성
    const context = {
        ...eventData.context,
        date: date,
        timeOfDay: 'afternoon',
        dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
    };

    // Daily Ritual 스타일 프롬프트 생성
    const { prompt, searchKeywords } = promptGen.generateRitualPrompt(context);

    console.log(`  💭 Prompt: "${prompt}"`);
    console.log(`  🔑 Keywords: ${searchKeywords.slice(0, 10).join(', ')}...`);

    // 소셜 미디어 데이터 수집
    const [instagramPosts, tiktokPosts] = await Promise.all([
        collectInstagram(searchKeywords, 50),
        collectTikTok(searchKeywords, 30)
    ]);

    const allPosts = [...instagramPosts, ...tiktokPosts];

    console.log(`  ✅ Collected ${allPosts.length} responses`);

    // 젠모지 생성
    console.log(`  🎨 Generating genmojis...`);
    const genmojiGen = new GenmojiGenerator();

    for (let i = 0; i < allPosts.length; i++) {
        const post = allPosts[i];
        try {
            const genmojiPath = await genmojiGen.generateGenmoji(post, `${date}_${i}`);
            post.genmoji = genmojiPath;
        } catch (error) {
            console.error(`    ❌ Failed to generate genmoji for post ${i}:`, error.message);
        }

        // API 레이트 리밋 방지 (1초 딜레이)
        if (i < allPosts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    genmojiGen.printStats();

    return {
        date: date,
        event: eventData.event,
        prompt: prompt,
        context: context,
        searchKeywords: searchKeywords,
        responses: allPosts,
        statistics: {
            total: allPosts.length,
            instagram: instagramPosts.length,
            tiktok: tiktokPosts.length,
            withGenmoji: allPosts.filter(p => p.genmoji).length
        }
    };
}

// 메인 실행
async function main() {
    console.log('🎯 Targeted Daily Ritual Data Collection');
    console.log('━'.repeat(60));
    
    const results = {};
    
    for (const [date, eventData] of Object.entries(NYC_EVENTS)) {
        try {
            const data = await collectForEvent(date, eventData);
            results[date] = data;
        } catch (error) {
            console.error(`  ❌ Error collecting ${date}:`, error.message);
        }
    }
    
    // 저장
    const outputDir = path.join(__dirname, '../json');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'targeted-ritual-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Collection complete!`);
    console.log(`📁 Saved to ${outputPath}`);
}

main();

