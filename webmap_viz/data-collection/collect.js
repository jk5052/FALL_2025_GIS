// Daily Ritual - Apify Data Collection Script
// Run with: node collect.js

import { ApifyClient } from 'apify-client';
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

// NYC event dates and contexts
const nycEvents = {
    '2024-04-05': {
        event: '4.8 Magnitude Earthquake',
        searchTerms: ['earthquake', 'nyc earthquake', 'shaking', 'quake']
    },
    '2024-04-08': {
        event: 'Total Solar Eclipse',
        searchTerms: ['eclipse', 'solar eclipse', 'eclipse nyc', 'totality']
    },
    '2024-05-30': {
        event: 'Trump Conviction',
        searchTerms: ['trump guilty', 'conviction', 'manhattan court']
    },
    '2024-11-05': {
        event: 'Election Day',
        searchTerms: ['election', 'vote', 'election day', 'polling']
    },
    '2024-12-09': {
        event: 'First Snow',
        searchTerms: ['first snow', 'nyc snow', 'snowfall', 'winter']
    }
};

// Collect Instagram data
async function collectInstagram(searchTerms, limit = 100) {
    console.log(`  📸 Collecting Instagram (${searchTerms.join(', ')})...`);

    try {
        const run = await client.actor("shu8hvrXbJbY3Eb9W").call({
            hashtags: [...searchTerms, 'nyc', 'manhattan'],
            resultsType: 'posts',
            resultsLimit: limit,
            addParentData: true
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // 사진 있는 것만 필터링
        const photoPosts = items.filter(item => item.displayUrl || item.thumbnailUrl);

        console.log(`     ✓ Found ${photoPosts.length} Instagram posts with photos (${items.length} total)`);

        return photoPosts.map(item => ({
            platform: 'instagram',
            id: item.id,
            timestamp: item.timestamp,
            text: item.caption || '',
            imageUrl: item.displayUrl || item.thumbnailUrl,  // 반드시 이미지
            imageThumbnail: item.thumbnailUrl || item.displayUrl, // 썸네일용
            videoUrl: item.videoUrl,
            hashtags: item.hashtags || [],
            location: item.locationName,
            lat: item.locationLat,
            lng: item.locationLng,
            likes: item.likesCount || 0,
            comments: item.commentsCount || 0,
            engagement: (item.likesCount || 0) + (item.commentsCount || 0),
            user: hashUsername(item.ownerUsername)
        }));
    } catch (error) {
        console.error('     ✗ Instagram error:', error.message);
        return [];
    }
}

// Collect TikTok data
async function collectTikTok(searchTerms, limit = 100) {
    console.log(`  🎵 Collecting TikTok (${searchTerms.join(', ')})...`);

    try {
        const run = await client.actor("OtzYfK1ndEGdwWFKQ").call({
            hashtags: [...searchTerms, 'nyc'],
            maxItems: limit,
            shouldDownloadVideos: false,
            shouldDownloadCovers: true
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // 비디오 썸네일 있는 것만 필터링
        const videosWithThumbnails = items.filter(item => item.covers?.default);

        console.log(`     ✓ Found ${videosWithThumbnails.length} TikTok videos with thumbnails (${items.length} total)`);

        return videosWithThumbnails.map(item => ({
            platform: 'tiktok',
            id: item.id,
            timestamp: new Date(item.createTime * 1000).toISOString(),
            text: item.text || item.desc || '',
            imageUrl: item.covers?.default || item.covers?.origin,
            imageThumbnail: item.covers?.default,
            videoUrl: item.videoUrl,
            hashtags: item.hashtags?.map(h => h.name) || [],
            lat: 40.7128 + (Math.random() - 0.5) * 0.1, // TikTok doesn't have location
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            likes: item.diggCount || 0,
            views: item.playCount || 0,
            shares: item.shareCount || 0,
            engagement: (item.diggCount || 0) + (item.shareCount || 0),
            user: hashUsername(item.author)
        }));
    } catch (error) {
        console.error('     ✗ TikTok error:', error.message);
        return [];
    }
}

// Collect Twitter data
async function collectTwitter(searchTerms, limit = 100) {
    console.log(`  🐦 Collecting Twitter/X (${searchTerms.join(', ')})...`);

    try {
        const run = await client.actor("quacker/twitter-scraper").call({
            searchTerms: [...searchTerms, 'nyc OR manhattan'],
            maxTweets: limit,
            addUserInfo: true
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // 이미지 있는 트윗만 필터링
        const tweetsWithMedia = items.filter(item => item.entities?.media?.[0]?.media_url_https);

        console.log(`     ✓ Found ${tweetsWithMedia.length} tweets with images (${items.length} total)`);

        return tweetsWithMedia.map(item => ({
            platform: 'twitter',
            id: item.id || item.id_str,
            timestamp: item.created_at || item.createdAt,
            text: item.full_text || item.text || '',
            imageUrl: item.entities?.media?.[0]?.media_url_https,
            imageThumbnail: item.entities?.media?.[0]?.media_url_https + ':small',
            hashtags: item.entities?.hashtags?.map(h => h.text) || [],
            lat: item.coordinates?.coordinates?.[1] || item.geo?.coordinates?.[0] || 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: item.coordinates?.coordinates?.[0] || item.geo?.coordinates?.[1] || -74.0060 + (Math.random() - 0.5) * 0.1,
            likes: item.favorite_count || 0,
            retweets: item.retweet_count || 0,
            engagement: (item.favorite_count || 0) + (item.retweet_count || 0),
            user: hashUsername(item.user?.screen_name || item.author?.userName)
        }));
    } catch (error) {
        console.error('     ✗ Twitter error:', error.message);
        return [];
    }
}

// Collect Facebook data
async function collectFacebook(searchTerms, limit = 50) {
    console.log(`  👥 Collecting Facebook (${searchTerms.join(', ')})...`);
    
    try {
        const run = await client.actor("apify/facebook-posts-scraper").call({
            searches: searchTerms.map(term => ({ searchTerm: term + ' NYC' })),
            maxPosts: limit,
            maxPostComments: 0,
            viewOption: 'CHRONOLOGICAL'
        });
        
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        console.log(`     ✓ Found ${items.length} Facebook posts`);
        
        return items.map(item => ({
            platform: 'facebook',
            id: item.postId || item.id,
            timestamp: item.time || item.timestamp,
            text: item.text || '',
            imageUrl: item.photo || item.images?.[0],
            hashtags: extractHashtags(item.text || ''),
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            likes: item.likes || 0,
            shares: item.shares || 0,
            comments: item.comments || 0,
            engagement: (item.likes || 0) + (item.shares || 0) + (item.comments || 0),
            user: hashUsername(item.user?.name)
        }));
    } catch (error) {
        console.error('     ✗ Facebook error:', error.message);
        return [];
    }
}

// Helper functions
function hashUsername(username) {
    if (!username) return 'anonymous';
    return 'user_' + username.substring(0, 3) + '_' + username.length;
}

function extractHashtags(text) {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.replace('#', ''));
}

// Main collection function
async function collectAllData() {
    console.log('🚀 Starting Daily Ritual Data Collection\n');
    console.log('━'.repeat(50));
    
    const allData = [];
    const stats = {
        total: 0,
        byPlatform: {},
        byDate: {}
    };
    
    // Option 1: Collect by event keywords (not date-specific)
    console.log('\n📅 Collecting data for NYC events...\n');
    
    for (const [date, eventInfo] of Object.entries(nycEvents)) {
        console.log(`Event: ${eventInfo.event}`);
        
        // Collect from all platforms
        const [instagram, tiktok, twitter, facebook] = await Promise.all([
            collectInstagram(eventInfo.searchTerms, 50),
            collectTikTok(eventInfo.searchTerms, 50),
            collectTwitter(eventInfo.searchTerms, 50),
            collectFacebook(eventInfo.searchTerms, 25)
        ]);
        
        // Combine all platform data
        const eventData = [...instagram, ...tiktok, ...twitter, ...facebook];
        
        // Add event context
        eventData.forEach(item => {
            item.eventContext = eventInfo.event;
            item.eventDate = date; // Note: This is the event date, not necessarily post date
        });
        
        allData.push(...eventData);
        
        // Update stats
        stats.byDate[date] = eventData.length;
        eventData.forEach(item => {
            stats.byPlatform[item.platform] = (stats.byPlatform[item.platform] || 0) + 1;
        });
        
        console.log(`  Total for this event: ${eventData.length}\n`);
    }
    
    // Option 2: Also collect general NYC data
    console.log('📍 Collecting general NYC social media...\n');
    
    const generalTerms = ['nyc', 'manhattan', 'newyork'];
    const [generalIg, generalTt, generalTw, generalFb] = await Promise.all([
        collectInstagram(generalTerms, 100),
        collectTikTok(generalTerms, 100),
        collectTwitter(generalTerms, 100),
        collectFacebook(generalTerms, 50)
    ]);
    
    const generalData = [...generalIg, ...generalTt, ...generalTw, ...generalFb];
    generalData.forEach(item => {
        item.eventContext = 'General NYC';
    });
    
    allData.push(...generalData);
    stats.total = allData.length;
    
    // Save raw data
    const dataDir = path.join(__dirname, '../data/raw');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save by platform
    const byPlatform = {};
    allData.forEach(item => {
        if (!byPlatform[item.platform]) byPlatform[item.platform] = [];
        byPlatform[item.platform].push(item);
    });
    
    Object.entries(byPlatform).forEach(([platform, data]) => {
        const filepath = path.join(dataDir, `${platform}.json`);
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`📁 Saved ${data.length} ${platform} posts to ${filepath}`);
    });
    
    // Save all data
    const allDataPath = path.join(dataDir, 'all-social-data.json');
    fs.writeFileSync(allDataPath, JSON.stringify(allData, null, 2));
    
    // Print summary
    console.log('\n' + '━'.repeat(50));
    console.log('📊 Collection Summary:\n');
    console.log(`Total posts collected: ${stats.total}`);
    console.log('\nBy Platform:');
    Object.entries(stats.byPlatform).forEach(([platform, count]) => {
        console.log(`  ${platform}: ${count}`);
    });
    console.log('\nBy Event:');
    Object.entries(stats.byDate).forEach(([date, count]) => {
        console.log(`  ${nycEvents[date].event}: ${count}`);
    });
    console.log('\n✅ Data collection complete!');
    console.log('Next step: Run process.js to convert to Daily Ritual format');
}

// Run the collection
collectAllData().catch(console.error);