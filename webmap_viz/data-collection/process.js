// Daily Ritual - Data Processing Script
// Converts raw social media data to Daily Ritual format
// Run with: node process.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DailyPromptGenerator } from './prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize prompt generator
const promptGenerator = new DailyPromptGenerator();

// Load raw data
function loadRawData() {
    const dataDir = path.join(__dirname, '../data/raw');
    const allDataPath = path.join(dataDir, 'all-social-data.json');
    
    if (!fs.existsSync(allDataPath)) {
        console.error('❌ No raw data found. Run collect.js first!');
        process.exit(1);
    }
    
    const rawData = JSON.parse(fs.readFileSync(allDataPath, 'utf8'));
    console.log(`📂 Loaded ${rawData.length} posts from raw data`);
    
    return rawData;
}

// Extract keywords from social media post
function extractKeywords(post) {
    const keywords = new Set();
    
    // 1. Use existing hashtags
    if (post.hashtags && post.hashtags.length > 0) {
        post.hashtags
            .filter(tag => !['nyc', 'newyork', 'manhattan'].includes(tag.toLowerCase()))
            .slice(0, 3)
            .forEach(tag => keywords.add(tag.toLowerCase()));
    }
    
    // 2. Extract emotional words from text
    const text = (post.text || '').toLowerCase();
    const emotionalWords = [
        // Positive
        'happy', 'excited', 'blessed', 'amazing', 'beautiful', 'love', 'wonderful',
        // Negative
        'scared', 'anxious', 'worried', 'stressed', 'angry', 'sad', 'terrible',
        // Intense
        'overwhelming', 'insane', 'crazy', 'wild', 'unbelievable', 'shocking',
        // Reflective
        'peaceful', 'quiet', 'contemplative', 'nostalgic', 'thoughtful',
        // States
        'tired', 'energized', 'confused', 'hopeful', 'determined'
    ];
    
    emotionalWords.forEach(word => {
        if (text.includes(word)) {
            keywords.add(word);
        }
    });
    
    // 3. Extract action words based on platform
    if (post.platform === 'instagram' && text.includes('mood')) keywords.add('mood');
    if (post.platform === 'tiktok' && text.includes('vibe')) keywords.add('vibe');
    if (post.platform === 'twitter' && text.includes('breaking')) keywords.add('urgent');
    
    return Array.from(keywords).slice(0, 5);
}

// Infer time of day from timestamp
function getTimeOfDay(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 9) return 'early morning';
    if (hour >= 9 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    if (hour >= 20 && hour < 23) return 'night';
    return 'late night';
}

// Convert to Daily Ritual format
function convertToRitualFormat(rawData) {
    console.log('\n🔄 Converting to Daily Ritual format...');
    
    // Group by date
    const byDate = {};
    
    rawData.forEach(post => {
        const date = new Date(post.timestamp).toISOString().split('T')[0];
        
        if (!byDate[date]) {
            byDate[date] = {
                date: date,
                posts: []
            };
        }
        
        byDate[date].posts.push(post);
    });
    
    // Process each date
    const ritualData = {};
    
    Object.entries(byDate).forEach(([date, dateData]) => {
        // Generate prompt for this date
        const context = inferContext(date, dateData.posts);
        const prompt = promptGenerator.generatePrompt(context);
        
        // Convert posts to responses
        const responses = dateData.posts.map(post => ({
            participantId: post.user,
            timestamp: post.timestamp,
            
            // Location with fuzzy coordinates
            location: {
                lat: post.lat || 40.7128 + (Math.random() - 0.5) * 0.1,
                lng: post.lng || -74.0060 + (Math.random() - 0.5) * 0.1,
                name: post.location || 'Manhattan'
            },
            
            // Response data
            photo: post.imageUrl,
            keywords: extractKeywords(post),
            
            // Metadata
            platform: post.platform,
            timeOfDay: getTimeOfDay(post.timestamp),
            engagement: post.engagement || 0,
            
            // Original context
            eventContext: post.eventContext,
            originalText: post.text
        }));
        
        // Find dominant patterns
        const patterns = analyzePatterns(responses);
        
        ritualData[date] = {
            date: date,
            prompt: prompt,
            context: context,
            event: context.event,
            responses: responses,
            statistics: {
                totalResponses: responses.length,
                platformBreakdown: patterns.platforms,
                timeDistribution: patterns.times,
                topKeywords: patterns.keywords,
                dominantEmotion: patterns.emotion
            }
        };
    });
    
    return ritualData;
}

// Infer context from posts
function inferContext(date, posts) {
    // Count event mentions
    const eventCounts = {};
    posts.forEach(post => {
        if (post.eventContext) {
            eventCounts[post.eventContext] = (eventCounts[post.eventContext] || 0) + 1;
        }
    });
    
    // Find dominant event
    const dominantEvent = Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        [0]?.[0] || 'Regular Day';
    
    // Analyze collective mood
    const keywords = posts.flatMap(p => extractKeywords(p));
    const mood = analyzeMood(keywords);
    
    // Day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    return {
        date: date,
        event: dominantEvent,
        mood: mood,
        dayOfWeek: dayOfWeek,
        postCount: posts.length
    };
}

// Analyze mood from keywords
function analyzeMood(keywords) {
    const moodScores = {
        anxious: 0,
        excited: 0,
        peaceful: 0,
        chaotic: 0,
        reflective: 0
    };
    
    const moodKeywords = {
        anxious: ['anxious', 'worried', 'stressed', 'nervous', 'scared'],
        excited: ['excited', 'amazing', 'wild', 'incredible', 'wow'],
        peaceful: ['peaceful', 'quiet', 'calm', 'serene', 'relaxed'],
        chaotic: ['crazy', 'insane', 'chaos', 'overwhelming', 'intense'],
        reflective: ['thoughtful', 'nostalgic', 'contemplative', 'remembering']
    };
    
    keywords.forEach(keyword => {
        Object.entries(moodKeywords).forEach(([mood, words]) => {
            if (words.includes(keyword)) {
                moodScores[mood]++;
            }
        });
    });
    
    // Find dominant mood
    return Object.entries(moodScores)
        .sort((a, b) => b[1] - a[1])
        [0]?.[0] || 'neutral';
}

// Analyze patterns in responses
function analyzePatterns(responses) {
    const patterns = {
        platforms: {},
        times: {},
        keywords: {},
        emotion: null
    };
    
    // Count platforms
    responses.forEach(r => {
        patterns.platforms[r.platform] = (patterns.platforms[r.platform] || 0) + 1;
        patterns.times[r.timeOfDay] = (patterns.times[r.timeOfDay] || 0) + 1;
        r.keywords.forEach(k => {
            patterns.keywords[k] = (patterns.keywords[k] || 0) + 1;
        });
    });
    
    // Sort keywords by frequency
    patterns.keywords = Object.entries(patterns.keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, val]) => ({...obj, [key]: val}), {});
    
    // Determine dominant emotion
    const allKeywords = Object.keys(patterns.keywords);
    patterns.emotion = analyzeMood(allKeywords);
    
    return patterns;
}

// Create sample data for visualization
function createSampleData(ritualData) {
    // Select interesting dates for the demo
    const sampleDates = [
        '2024-04-05', // Earthquake
        '2024-04-08', // Eclipse
        '2024-05-30', // Trump Conviction
        '2024-11-05', // Election Day
        '2024-12-09'  // First Snow
    ];
    
    const sampleData = {};
    
    // Get data for each sample date or create mock data
    sampleDates.forEach(date => {
        if (ritualData[date]) {
            sampleData[date] = ritualData[date];
        } else {
            // Create mock data for missing dates
            sampleData[date] = createMockDataForDate(date);
        }
    });
    
    return sampleData;
}

// Create mock data for demonstration
function createMockDataForDate(date) {
    const events = {
        '2024-04-05': { event: 'Earthquake', mood: 'anxious' },
        '2024-04-08': { event: 'Solar Eclipse', mood: 'excited' },
        '2024-05-30': { event: 'Trump Conviction', mood: 'chaotic' },
        '2024-11-05': { event: 'Election Day', mood: 'anxious' },
        '2024-12-09': { event: 'First Snow', mood: 'peaceful' }
    };
    
    const eventInfo = events[date] || { event: 'Regular Day', mood: 'neutral' };
    
    // Generate mock responses
    const responseCount = 50 + Math.floor(Math.random() * 100);
    const responses = [];
    
    for (let i = 0; i < responseCount; i++) {
        responses.push({
            participantId: `user_mock_${i}`,
            timestamp: `${date}T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00:00`,
            location: {
                lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                lng: -74.0060 + (Math.random() - 0.5) * 0.1,
                name: 'Manhattan'
            },
            photo: `https://picsum.photos/400/400?random=${i}`,
            keywords: generateMockKeywords(eventInfo.mood),
            platform: ['instagram', 'tiktok', 'twitter', 'facebook'][Math.floor(Math.random() * 4)],
            timeOfDay: ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)],
            engagement: Math.floor(Math.random() * 1000)
        });
    }
    
    const context = {
        date: date,
        event: eventInfo.event,
        mood: eventInfo.mood,
        dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
    };
    
    return {
        date: date,
        prompt: promptGenerator.generatePrompt(context),
        context: context,
        event: eventInfo.event,
        responses: responses,
        statistics: analyzePatterns(responses)
    };
}

// Generate mock keywords based on mood
function generateMockKeywords(mood) {
    const keywordSets = {
        anxious: ['worried', 'nervous', 'uncertain', 'stressed', 'tense'],
        excited: ['thrilled', 'amazing', 'incredible', 'wow', 'energized'],
        peaceful: ['calm', 'quiet', 'serene', 'content', 'relaxed'],
        chaotic: ['crazy', 'wild', 'intense', 'overwhelming', 'hectic'],
        neutral: ['ordinary', 'normal', 'routine', 'regular', 'typical']
    };
    
    const keywords = keywordSets[mood] || keywordSets.neutral;
    return keywords.sort(() => 0.5 - Math.random()).slice(0, 3);
}

// Save processed data
function saveProcessedData(ritualData, sampleData) {
    const processedDir = path.join(__dirname, '../data/processed');
    
    if (!fs.existsSync(processedDir)) {
        fs.mkdirSync(processedDir, { recursive: true });
    }
    
    // Save full ritual data
    const fullPath = path.join(processedDir, 'ritual-format.json');
    fs.writeFileSync(fullPath, JSON.stringify(ritualData, null, 2));
    console.log(`📁 Saved full ritual data to ${fullPath}`);
    
    // Save by date
    const byDatePath = path.join(processedDir, 'by-date.json');
    fs.writeFileSync(byDatePath, JSON.stringify(ritualData, null, 2));
    console.log(`📁 Saved by-date data to ${byDatePath}`);
    
    // Save sample data for visualization
    const samplePath = path.join(processedDir, 'sample-data.json');
    fs.writeFileSync(samplePath, JSON.stringify(sampleData, null, 2));
    console.log(`📁 Saved sample data to ${samplePath}`);
    
    // Create summary statistics
    const summary = createSummary(ritualData);
    const summaryPath = path.join(processedDir, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📁 Saved summary to ${summaryPath}`);
}

// Create summary statistics
function createSummary(ritualData) {
    const summary = {
        totalDates: Object.keys(ritualData).length,
        totalResponses: 0,
        dateRange: {
            start: null,
            end: null
        },
        platformTotals: {},
        topKeywordsOverall: {},
        eventBreakdown: {}
    };
    
    const dates = Object.keys(ritualData).sort();
    summary.dateRange.start = dates[0];
    summary.dateRange.end = dates[dates.length - 1];
    
    Object.values(ritualData).forEach(day => {
        summary.totalResponses += day.responses.length;
        
        // Platform breakdown
        Object.entries(day.statistics.platformBreakdown).forEach(([platform, count]) => {
            summary.platformTotals[platform] = (summary.platformTotals[platform] || 0) + count;
        });
        
        // Keywords
        Object.entries(day.statistics.topKeywords).forEach(([keyword, count]) => {
            summary.topKeywordsOverall[keyword] = (summary.topKeywordsOverall[keyword] || 0) + count;
        });
        
        // Events
        summary.eventBreakdown[day.event] = (summary.eventBreakdown[day.event] || 0) + day.responses.length;
    });
    
    // Sort top keywords
    summary.topKeywordsOverall = Object.entries(summary.topKeywordsOverall)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .reduce((obj, [key, val]) => ({...obj, [key]: val}), {});
    
    return summary;
}

// Main processing function
async function processData() {
    console.log('🔄 Daily Ritual Data Processing\n');
    console.log('━'.repeat(50));
    
    // Load raw data
    const rawData = loadRawData();
    
    // Convert to ritual format
    const ritualData = convertToRitualFormat(rawData);
    
    // Create sample data for visualization
    const sampleData = createSampleData(ritualData);
    
    // Save processed data
    saveProcessedData(ritualData, sampleData);
    
    // Print summary
    console.log('\n' + '━'.repeat(50));
    console.log('📊 Processing Summary:\n');
    console.log(`Total dates processed: ${Object.keys(ritualData).length}`);
    console.log(`Total responses: ${Object.values(ritualData).reduce((sum, d) => sum + d.responses.length, 0)}`);
    
    // Top events
    const eventCounts = {};
    Object.values(ritualData).forEach(day => {
        eventCounts[day.event] = (eventCounts[day.event] || 0) + day.responses.length;
    });
    
    console.log('\nTop Events:');
    Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([event, count]) => {
            console.log(`  ${event}: ${count} responses`);
        });
    
    console.log('\n✅ Processing complete!');
    console.log('Data ready for visualization at ../data/processed/sample-data.json');
}

// Run the processing
processData().catch(console.error);