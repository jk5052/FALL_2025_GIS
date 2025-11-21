// Generate realistic sample data for webmap visualization with genmoji support

import fs from 'fs';

// Realistic social media keywords by event type
const realWorldKeywords = {
    earthquake: {
        immediate: ['earthquake', 'quake', 'shaking', 'tremor', 'shook', 'felt', 'aftershock', 'magnitude'],
        reactions: ['omg', 'wtf', 'holy', 'crazy', 'insane', 'wild', 'scary', 'terrifying', 'survived', 'safe'],
        locations: ['nyc', 'manhattan', 'brooklyn', 'queens', 'newyork', 'timessquare', 'centralpark'],
        descriptions: ['building', 'swaying', 'rolling', 'rumbling', 'vibrating', 'moving', 'rocking'],
        emotions: ['scared', 'anxious', 'nervous', 'shaken', 'worried', 'panicked', 'shocked', 'relieved']
    },
    
    eclipse: {
        immediate: ['eclipse', 'solar', 'totality', 'sun', 'moon', 'shadow', 'corona'],
        reactions: ['wow', 'amazing', 'incredible', 'beautiful', 'stunning', 'awesome', 'mindblowing'],
        viewing: ['glasses', 'watching', 'viewing', 'witnessed', 'experienced', 'observed'],
        emotions: ['awestruck', 'moved', 'spiritual', 'connected', 'humbled', 'inspired', 'wonder']
    },
    
    election: {
        immediate: ['voted', 'voting', 'election', 'ballot', 'polls', 'democracy', 'vote'],
        emotions: ['anxious', 'nervous', 'hopeful', 'excited', 'worried', 'proud', 'patriotic'],
        process: ['line', 'wait', 'queue', 'hours', 'long', 'worth', 'finally', 'done'],
        social: ['sticker', 'selfie', 'civic', 'duty', 'voice', 'matters', 'counts']
    },
    
    snow: {
        immediate: ['snow', 'snowing', 'snowfall', 'flurries', 'blizzard', 'winter', 'storm'],
        reactions: ['finally', 'yes', 'love', 'beautiful', 'magical', 'perfect', 'gorgeous'],
        descriptions: ['white', 'fluffy', 'powder', 'heavy', 'fresh', 'untouched'],
        activities: ['snowman', 'snowball', 'sledding', 'playing', 'walking'],
        emotions: ['excited', 'happy', 'cozy', 'nostalgic', 'peaceful', 'calm', 'joyful']
    },
    
    trump: {
        immediate: ['guilty', 'verdict', 'convicted', 'trial', 'jury', 'court', 'judge'],
        reactions: ['finally', 'justice', 'shocked', 'unbelievable', 'historic', 'unprecedented'],
        emotions: ['vindicated', 'satisfied', 'angry', 'concerned', 'worried', 'celebrating'],
        locations: ['manhattan', 'courthouse', 'downtown', 'streets', 'gathering', 'crowds']
    }
};

// Time-based keywords
const timeBasedKeywords = {
    morning: ['coffee', 'sunrise', 'early', 'commute', 'breakfast', 'rush'],
    afternoon: ['lunch', 'busy', 'crowded', 'hot', 'bright', 'midday'],
    evening: ['sunset', 'golden', 'dinner', 'drinks', 'date', 'plans'],
    night: ['dark', 'lights', 'party', 'late', 'quiet', 'peaceful']
};

// Platform-specific keywords
const platformKeywords = {
    instagram: ['aesthetic', 'mood', 'vibe', 'instagood', 'photooftheday'],
    tiktok: ['fyp', 'foryou', 'viral', 'trend', 'pov'],
    twitter: ['breaking', 'trending', 'thoughts', 'opinion'],
    facebook: ['shared', 'community', 'local', 'update']
};

// NYC locations with realistic coordinates
const nycLocations = [
    { name: 'Times Square', lat: 40.7580, lng: -73.9855, range: 0.005 },
    { name: 'Central Park', lat: 40.7829, lng: -73.9654, range: 0.02 },
    { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969, range: 0.005 },
    { name: 'Empire State Building', lat: 40.7484, lng: -73.9857, range: 0.003 },
    { name: 'Grand Central', lat: 40.7527, lng: -73.9772, range: 0.005 },
    { name: 'Union Square', lat: 40.7359, lng: -73.9911, range: 0.005 },
    { name: 'Washington Square', lat: 40.7308, lng: -73.9973, range: 0.004 },
    { name: 'High Line', lat: 40.7480, lng: -74.0048, range: 0.008 },
    { name: 'Williamsburg', lat: 40.7081, lng: -73.9571, range: 0.02 },
    { name: 'DUMBO', lat: 40.7033, lng: -73.9881, range: 0.008 }
];

// Generate realistic hashtags from keywords
function generateHashtags(keywords, eventType) {
    const hashtags = keywords.map(k => `#${k}`);
    
    // Add common NYC hashtags
    const nycTags = ['#nyc', '#newyork', '#manhattan', '#brooklyn'];
    hashtags.push(nycTags[Math.floor(Math.random() * nycTags.length)]);
    
    // Add event-specific hashtags
    if (eventType === 'earthquake') hashtags.push('#earthquake');
    if (eventType === 'eclipse') hashtags.push('#solareclipse');
    if (eventType === 'election') hashtags.push('#election2024');
    if (eventType === 'snow') hashtags.push('#snow');
    if (eventType === 'trump') hashtags.push('#breaking');
    
    return hashtags.slice(0, 5);
}

// Generate realistic caption text
function generateCaption(keywords, eventType, timeOfDay) {
    const templates = {
        earthquake: [
            `Did anyone else feel that?? ${keywords[0]} in ${keywords[1] || 'NYC'}`,
            `OMG the whole building was ${keywords[0]}! Everyone okay?`,
            `That ${keywords[0]} was WILD. Still ${keywords[1] || 'shaking'}`
        ],
        eclipse: [
            `This ${keywords[0]} is absolutely ${keywords[1] || 'beautiful'}`,
            `${keywords[0]} ${keywords[1] || 'moment'} - once in a lifetime`,
            `Can't believe I'm ${keywords[0]} this right now`
        ],
        election: [
            `Just ${keywords[0]}! ${keywords[1] || 'democracy'} in action`,
            `${keywords[0]} after ${keywords[1] || 'hours'} in line. Worth it!`,
            `${keywords[0]} done! Now we wait...`
        ],
        snow: [
            `${keywords[0]} in NYC! Finally ${keywords[1] || 'winter'}`,
            `This ${keywords[0]} is ${keywords[1] || 'beautiful'}`,
            `${keywords[0]} day in the city ❄️`
        ],
        trump: [
            `${keywords[0]} - ${keywords[1] || 'historic'} moment`,
            `Can't believe this is ${keywords[0]}`,
            `${keywords[0]} ${keywords[1] || 'finally'}`
        ]
    };
    
    const eventTemplates = templates[eventType] || templates.earthquake;
    return eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
}

// Generate keywords for a post
function generateRealisticKeywords(eventType, timeOfDay, platform) {
    const keywords = [];
    const numKeywords = 3 + Math.floor(Math.random() * 3); // 3-5 keywords

    const eventPool = realWorldKeywords[eventType];

    for (let i = 0; i < numKeywords; i++) {
        let keyword;
        const strategy = Math.random();

        if (strategy < 0.5 && eventPool) {
            // 50% - Event-related
            const categories = Object.keys(eventPool);
            const category = categories[Math.floor(Math.random() * categories.length)];
            const pool = eventPool[category];
            keyword = pool[Math.floor(Math.random() * pool.length)];
        } else if (strategy < 0.7) {
            // 20% - Time-based
            const timeKeywords = timeBasedKeywords[timeOfDay] || timeBasedKeywords.afternoon;
            keyword = timeKeywords[Math.floor(Math.random() * timeKeywords.length)];
        } else {
            // 30% - Platform-specific
            const platKeywords = platformKeywords[platform];
            keyword = platKeywords[Math.floor(Math.random() * platKeywords.length)];
        }

        if (keyword && !keywords.includes(keyword)) {
            keywords.push(keyword);
        }
    }

    // Ensure minimum keywords
    while (keywords.length < 3) {
        const fallback = ['nyc', 'manhattan', 'city', 'today', 'life'];
        const keyword = fallback[Math.floor(Math.random() * fallback.length)];
        if (!keywords.includes(keyword)) {
            keywords.push(keyword);
        }
    }

    return keywords;
}

// Generate responses for an event
function generateResponses(event, eventType, date, count = 200) {
    const responses = [];
    const platforms = ['instagram', 'tiktok', 'twitter', 'facebook'];

    for (let i = 0; i < count; i++) {
        const location = nycLocations[Math.floor(Math.random() * nycLocations.length)];

        // Time generation
        let hour = Math.floor(Math.random() * 24);
        if (eventType === 'earthquake') hour = 14 + Math.floor(Math.random() * 6);
        if (eventType === 'eclipse') hour = 12 + Math.floor(Math.random() * 4);

        const minute = Math.floor(Math.random() * 60);
        const timestamp = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`).getTime();

        // Time of day
        let timeOfDay;
        if (hour < 12) timeOfDay = 'morning';
        else if (hour < 17) timeOfDay = 'afternoon';
        else if (hour < 20) timeOfDay = 'evening';
        else timeOfDay = 'night';

        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const keywords = generateRealisticKeywords(eventType, timeOfDay, platform);
        const hashtags = generateHashtags(keywords, eventType);
        const text = generateCaption(keywords, eventType, timeOfDay);

        // Engagement (realistic distribution)
        const viral = Math.random() < 0.02;
        const popular = Math.random() < 0.15;

        let engagement;
        if (platform === 'tiktok') {
            engagement = viral ? Math.floor(Math.random() * 100000) + 50000 :
                        popular ? Math.floor(Math.random() * 10000) + 5000 :
                        Math.floor(Math.random() * 1000) + 50;
        } else if (platform === 'instagram') {
            engagement = viral ? Math.floor(Math.random() * 20000) + 10000 :
                        popular ? Math.floor(Math.random() * 2000) + 1000 :
                        Math.floor(Math.random() * 500) + 20;
        } else {
            engagement = viral ? Math.floor(Math.random() * 5000) + 2000 :
                        popular ? Math.floor(Math.random() * 500) + 200 :
                        Math.floor(Math.random() * 100) + 5;
        }

        responses.push({
            id: `${eventType}_${i.toString().padStart(5, '0')}`,
            participantId: `user_${Math.random().toString(36).substr(2, 9)}`,
            platform: platform,
            timestamp: timestamp,
            lat: location.lat + (Math.random() - 0.5) * location.range,
            lng: location.lng + (Math.random() - 0.5) * location.range,
            text: text,
            hashtags: hashtags,
            keywords: keywords,
            engagement: engagement,
            timeOfDay: timeOfDay,
            location: location.name,
            imageThumbnail: `https://source.unsplash.com/400x400/?${keywords.join(',')}`,
            imageUrl: `https://source.unsplash.com/800x800/?${keywords.join(',')}`
        });
    }

    return responses;
}

// Main generation function
function generateSampleData() {
    console.log('🎨 Generating sample data for webmap visualization...\n');

    const sampleData = {
        "2024-04-05": {
            date: "2024-04-05",
            event: "4.8 Magnitude Earthquake",
            prompt: "Find where stillness lives after everything moves",
            responses: generateResponses("Earthquake", "earthquake", "2024-04-05", 200)
        },
        "2024-04-08": {
            date: "2024-04-08",
            event: "Total Solar Eclipse",
            prompt: "Document three shadows that don't belong to you",
            responses: generateResponses("Solar Eclipse", "eclipse", "2024-04-08", 250)
        },
        "2024-05-30": {
            date: "2024-05-30",
            event: "Trump Convicted",
            prompt: "Where does justice wait in Manhattan?",
            responses: generateResponses("Trump Conviction", "trump", "2024-05-30", 180)
        },
        "2024-11-05": {
            date: "2024-11-05",
            event: "Presidential Election Day",
            prompt: "What accumulates in the space between choices?",
            responses: generateResponses("Election", "election", "2024-11-05", 300)
        },
        "2024-12-09": {
            date: "2024-12-09",
            event: "First Snow of the Season",
            prompt: "Show me what remains warm",
            responses: generateResponses("First Snow", "snow", "2024-12-09", 200)
        }
    };

    // Add statistics for each event
    Object.values(sampleData).forEach(day => {
        const allKeywords = day.responses.flatMap(r => r.keywords);
        const uniqueKeywords = [...new Set(allKeywords)];

        const keywordCounts = allKeywords.reduce((acc, k) => {
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {});

        const topKeywords = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([keyword, count]) => ({ keyword, count }));

        day.statistics = {
            total: day.responses.length,
            instagram: day.responses.filter(r => r.platform === 'instagram').length,
            tiktok: day.responses.filter(r => r.platform === 'tiktok').length,
            twitter: day.responses.filter(r => r.platform === 'twitter').length,
            facebook: day.responses.filter(r => r.platform === 'facebook').length,
            uniqueKeywords: uniqueKeywords.length,
            topKeywords: topKeywords
        };

        console.log(`📅 ${day.date}: ${day.event}`);
        console.log(`   💭 Prompt: "${day.prompt}"`);
        console.log(`   📊 ${day.responses.length} responses`);
        console.log(`   🔑 ${uniqueKeywords.length} unique keywords`);
        console.log(`   📱 Instagram: ${day.statistics.instagram}, TikTok: ${day.statistics.tiktok}`);
        console.log('');
    });

    // Save to file
    const outputPath = '../json/targeted-ritual-data.json';
    fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));

    const totalResponses = Object.values(sampleData).reduce((sum, d) => sum + d.responses.length, 0);

    console.log('✅ Sample data generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 Total: ${totalResponses} responses across 5 events`);
    console.log('\n🎨 Ready for genmoji generation!');
}

// Run
generateSampleData();

