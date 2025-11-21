// Daily Ritual - Demo Data Generator

const demoData = {
    // NYC neighborhoods for random location selection
    neighborhoods: [
        { name: 'Upper West Side', lat: 40.7831, lng: -73.9712 },
        { name: 'Upper East Side', lat: 40.7870, lng: -73.9754 },
        { name: 'Midtown', lat: 40.7614, lng: -73.9776 },
        { name: 'Chelsea', lat: 40.7489, lng: -73.9872 },
        { name: 'Greenwich Village', lat: 40.7336, lng: -74.0027 },
        { name: 'East Village', lat: 40.7282, lng: -73.9942 },
        { name: 'SoHo', lat: 40.7211, lng: -74.0048 },
        { name: 'Tribeca', lat: 40.7165, lng: -74.0090 },
        { name: 'Financial District', lat: 40.7074, lng: -74.0113 },
        { name: 'Harlem', lat: 40.8014, lng: -73.9654 },
        { name: 'Brooklyn Heights', lat: 40.6960, lng: -73.9936 },
        { name: 'Williamsburg', lat: 40.7081, lng: -73.9571 }
    ],
    
    // Keyword pools for different moods/contexts
    keywordPools: {
        morning: ['coffee', 'rush', 'beginning', 'fresh', 'routine', 'commute', 'awakening'],
        afternoon: ['busy', 'productive', 'lunch', 'midday', 'focused', 'momentum', 'peak'],
        evening: ['sunset', 'unwind', 'transition', 'golden', 'relaxed', 'social', 'dinner'],
        night: ['quiet', 'lights', 'peaceful', 'intimate', 'reflection', 'rest', 'solitude'],
        
        emotional: ['anxious', 'hopeful', 'excited', 'calm', 'nostalgic', 'grateful', 'contemplative'],
        descriptive: ['crowded', 'empty', 'vibrant', 'still', 'chaotic', 'serene', 'ordinary'],
        abstract: ['belonging', 'distance', 'memory', 'possibility', 'identity', 'connection', 'freedom'],
        
        weather: {
            sunny: ['bright', 'warm', 'clear', 'shadow', 'light'],
            cloudy: ['gray', 'soft', 'diffused', 'overcast', 'muted'],
            rainy: ['wet', 'reflection', 'umbrella', 'puddles', 'shelter'],
            snowy: ['white', 'quiet', 'cold', 'transformed', 'footprints']
        }
    },
    
    // Sample prompts
    prompts: [
        "Find where stillness lives in movement",
        "Document three shades of ordinary",
        "Show me what remains after the crowd leaves",
        "Where does tomorrow begin today?",
        "Capture the weight of waiting",
        "Frame silence in a noisy place",
        "What color is Tuesday at 3pm?",
        "Find warmth in concrete",
        "Show me your version of home",
        "Document the space between here and there"
    ],
    
    // Generate random demo submission
    generateSubmission() {
        const neighborhood = this.neighborhoods[Math.floor(Math.random() * this.neighborhoods.length)];
        const timeOfDay = this.getRandomTimeOfDay();
        const keywords = this.generateKeywords(timeOfDay);
        
        return {
            participantId: this.generateParticipantId(),
            prompt: this.prompts[Math.floor(Math.random() * this.prompts.length)],
            keywords: keywords,
            photoUrl: `https://picsum.photos/400/400?random=${Date.now()}_${Math.random()}`,
            location: {
                lat: neighborhood.lat + (Math.random() - 0.5) * 0.005,
                lng: neighborhood.lng + (Math.random() - 0.5) * 0.005,
                name: neighborhood.name
            },
            timeOfDay: timeOfDay,
            timestamp: this.generateRandomTimestamp(),
            date: new Date().toISOString().split('T')[0],
            platform: 'demo'
        };
    },
    
    // Generate multiple demo submissions
    generateDemoSubmissions(count = 20) {
        const submissions = [];
        for (let i = 0; i < count; i++) {
            submissions.push(this.generateSubmission());
        }
        return submissions;
    },
    
    // Generate participant ID
    generateParticipantId() {
        return `demo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    },
    
    // Get random time of day
    getRandomTimeOfDay() {
        const times = ['morning', 'afternoon', 'evening', 'night'];
        return times[Math.floor(Math.random() * times.length)];
    },
    
    // Generate contextual keywords
    generateKeywords(timeOfDay) {
        const keywords = [];
        
        // Add time-specific keyword
        const timeKeywords = this.keywordPools[timeOfDay];
        keywords.push(timeKeywords[Math.floor(Math.random() * timeKeywords.length)]);
        
        // Add emotional keyword
        const emotional = this.keywordPools.emotional;
        keywords.push(emotional[Math.floor(Math.random() * emotional.length)]);
        
        // Add descriptive keyword
        const descriptive = this.keywordPools.descriptive;
        keywords.push(descriptive[Math.floor(Math.random() * descriptive.length)]);
        
        // Sometimes add abstract keyword
        if (Math.random() > 0.5) {
            const abstract = this.keywordPools.abstract;
            keywords.push(abstract[Math.floor(Math.random() * abstract.length)]);
        }
        
        // Sometimes add weather keyword
        if (Math.random() > 0.6) {
            const weatherTypes = Object.keys(this.keywordPools.weather);
            const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            const weatherKeywords = this.keywordPools.weather[weather];
            keywords.push(weatherKeywords[Math.floor(Math.random() * weatherKeywords.length)]);
        }
        
        // Return 3-5 keywords
        return keywords.slice(0, 3 + Math.floor(Math.random() * 3));
    },
    
    // Generate random timestamp for today
    generateRandomTimestamp() {
        const today = new Date();
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        today.setHours(hour, minute, 0, 0);
        return today.toISOString();
    },
    
    // Generate themed submissions for specific events
    generateEventSubmissions(event, count = 10) {
        const eventKeywords = {
            earthquake: ['shaken', 'still', 'survived', 'together', 'fragile', 'solid'],
            snow: ['white', 'quiet', 'transformed', 'cold', 'beautiful', 'peaceful'],
            election: ['voted', 'anxious', 'hopeful', 'divided', 'civic', 'future'],
            heatwave: ['melting', 'exhausted', 'shelter', 'AC', 'unbearable', 'summer']
        };
        
        const submissions = [];
        const keywords = eventKeywords[event] || this.keywordPools.emotional;
        
        for (let i = 0; i < count; i++) {
            const submission = this.generateSubmission();
            
            // Replace some keywords with event-specific ones
            const eventSpecific = [];
            eventSpecific.push(keywords[Math.floor(Math.random() * keywords.length)]);
            eventSpecific.push(keywords[Math.floor(Math.random() * keywords.length)]);
            eventSpecific.push(...submission.keywords.slice(2));
            
            submission.keywords = eventSpecific.slice(0, 4);
            submission.event = event;
            
            submissions.push(submission);
        }
        
        return submissions;
    },
    
    // Create a connected network of submissions
    generateConnectedSubmissions(count = 15) {
        const submissions = [];
        const sharedKeywords = ['together', 'moment', 'city', 'today', 'here'];
        
        for (let i = 0; i < count; i++) {
            const submission = this.generateSubmission();
            
            // Add at least one shared keyword to create connections
            if (i > 0 && Math.random() > 0.3) {
                const sharedKeyword = sharedKeywords[Math.floor(Math.random() * sharedKeywords.length)];
                submission.keywords[0] = sharedKeyword;
            }
            
            submissions.push(submission);
        }
        
        return submissions;
    },
    
    // Generate realistic photo URLs with different themes
    generatePhotoUrl(theme = 'random') {
        const themes = {
            urban: [
                'city', 'building', 'street', 'architecture', 'urban',
                'subway', 'bridge', 'skyline', 'traffic', 'downtown'
            ],
            nature: [
                'park', 'tree', 'sky', 'clouds', 'sunset',
                'river', 'landscape', 'flowers', 'autumn', 'spring'
            ],
            people: [
                'crowd', 'portrait', 'community', 'friends', 'gathering',
                'cafe', 'restaurant', 'market', 'festival', 'celebration'
            ],
            abstract: [
                'texture', 'pattern', 'minimal', 'geometric', 'color',
                'light', 'shadow', 'reflection', 'blur', 'abstract'
            ]
        };
        
        let keyword;
        if (theme === 'random' || !themes[theme]) {
            const allKeywords = Object.values(themes).flat();
            keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];
        } else {
            keyword = themes[theme][Math.floor(Math.random() * themes[theme].length)];
        }
        
        // Use Lorem Picsum with seed for consistency
        const seed = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/seed/${keyword}_${seed}/400/400`;
    }
};

// Load demo data function
function loadDemoData() {
    console.log('Loading demo data...');
    
    // Generate various types of submissions
    const regularSubmissions = demoData.generateDemoSubmissions(10);
    const connectedSubmissions = demoData.generateConnectedSubmissions(10);
    const eventSubmissions = demoData.generateEventSubmissions('snow', 5);
    
    // Combine all submissions
    const allSubmissions = [
        ...regularSubmissions,
        ...connectedSubmissions,
        ...eventSubmissions
    ];
    
    // Store in localStorage as demo submissions
    localStorage.setItem('demoSubmissions', JSON.stringify(allSubmissions));
    
    // Update global submissions array
    window.submissions = allSubmissions;
    
    // If map is initialized, update it
    if (window.map && window.mapFunctions) {
        window.mapFunctions.updateMapData(allSubmissions);
    }
    
    console.log(`Loaded ${allSubmissions.length} demo submissions`);
    
    return allSubmissions;
}

// Clear all demo data
function clearDemoData() {
    localStorage.removeItem('demoSubmissions');
    window.submissions = [];
    console.log('Demo data cleared');
}

// Export demo data object
window.demoData = demoData;
window.loadDemoData = loadDemoData;
window.clearDemoData = clearDemoData;

console.log('Demo-data.js loaded');