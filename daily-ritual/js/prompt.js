// Daily Ritual - Prompt Generation System

// Prompt templates
const promptTemplates = {
    observation: [
        "Notice the {quality} of {subject} today",
        "Find where {emotion} {verb} in this moment",
        "Document the space between {state1} and {state2}",
        "Show me what {concept} looks like right now"
    ],
    question: [
        "What {verb} when no one is watching?",
        "Where does {abstract} live in your neighborhood?",
        "How does {feeling} manifest in {place}?",
        "What color is {concept} today?"
    ],
    instruction: [
        "Capture three moments of {quality}",
        "Frame the {invisible} through the {visible}",
        "Find {emotion} hiding in plain sight",
        "Document your {timeframe} {ritual}"
    ],
    poetic: [
        "Between {concept1} and {concept2}, what emerges?",
        "The city {verb}, how do you {respond}?",
        "Show me {quantity} of {abstract}",
        "What {remains} after {event}?"
    ]
};

// Vocabulary banks
const vocabulary = {
    qualities: ['weight', 'texture', 'rhythm', 'temperature', 'velocity', 'echo', 'shadow'],
    subjects: ['strangers', 'corners', 'thresholds', 'distances', 'reflections', 'pauses', 'movements'],
    emotions: ['stillness', 'anticipation', 'tenderness', 'restlessness', 'belonging', 'solitude', 'wonder'],
    verbs: ['accumulates', 'dissolves', 'whispers', 'unfolds', 'resists', 'embraces', 'transforms'],
    abstracts: ['memory', 'possibility', 'connection', 'silence', 'change', 'presence', 'absence'],
    concepts: ['home', 'tomorrow', 'identity', 'community', 'freedom', 'safety', 'truth'],
    feelings: ['comfort', 'urgency', 'nostalgia', 'hope', 'uncertainty', 'relief', 'longing'],
    places: ['the ordinary', 'transition', 'routine', 'encounter', 'solitude', 'gathering', 'passage'],
    invisibles: ['unseen', 'unspoken', 'unnoticed', 'forgotten', 'hidden', 'subtle', 'quiet'],
    visibles: ['surface', 'obvious', 'immediate', 'present', 'tangible', 'clear', 'shown'],
    timeframes: ['morning', 'afternoon', 'evening', 'daily', 'momentary', 'recurring', 'fleeting'],
    rituals: ['preparation', 'transition', 'pause', 'movement', 'observation', 'connection', 'reflection'],
    quantities: ['fragments', 'traces', 'layers', 'echoes', 'glimpses', 'pieces', 'instances'],
    events: ['the day begins', 'crowds disperse', 'light changes', 'silence falls', 'movement stops', 'time shifts']
};

// Context modifiers based on conditions
const contextModifiers = {
    weather: {
        rain: {
            qualities: ['wet', 'blurred', 'reflected', 'gray'],
            emotions: ['melancholy', 'introspection', 'shelter', 'flow'],
            verbs: ['pools', 'streams', 'drops', 'washes']
        },
        snow: {
            qualities: ['quiet', 'white', 'soft', 'transformed'],
            emotions: ['wonder', 'isolation', 'peace', 'suspension'],
            verbs: ['blankets', 'muffles', 'covers', 'stills']
        },
        sunny: {
            qualities: ['bright', 'warm', 'sharp', 'clear'],
            emotions: ['openness', 'energy', 'possibility', 'exposure'],
            verbs: ['illuminates', 'reveals', 'warms', 'casts']
        },
        cloudy: {
            qualities: ['diffused', 'gray', 'even', 'subdued'],
            emotions: ['neutrality', 'waiting', 'ambiguity', 'transition'],
            verbs: ['softens', 'obscures', 'flattens', 'holds']
        }
    },
    timeOfDay: {
        morning: {
            concepts: ['beginning', 'preparation', 'potential', 'routine'],
            feelings: ['fresh', 'rushed', 'hopeful', 'automatic']
        },
        afternoon: {
            concepts: ['momentum', 'peak', 'productivity', 'brightness'],
            feelings: ['focused', 'tired', 'accomplished', 'restless']
        },
        evening: {
            concepts: ['transition', 'release', 'gathering', 'unwinding'],
            feelings: ['relief', 'social', 'exhausted', 'anticipatory']
        },
        night: {
            concepts: ['rest', 'reflection', 'solitude', 'dreams'],
            feelings: ['quiet', 'intimate', 'anxious', 'peaceful']
        }
    },
    dayOfWeek: {
        monday: ['beginning', 'reluctance', 'momentum', 'routine'],
        friday: ['anticipation', 'release', 'completion', 'celebration'],
        weekend: ['freedom', 'rest', 'possibility', 'escape']
    }
};

// Generate today's prompt
function generateDailyPrompt() {
    const context = getCurrentContext();
    
    // Select template category based on context
    const templateCategories = Object.keys(promptTemplates);
    const selectedCategory = templateCategories[Math.floor(Math.random() * templateCategories.length)];
    
    // Select specific template
    const templates = promptTemplates[selectedCategory];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Generate contextual vocabulary
    const contextVocab = generateContextualVocabulary(context);
    
    // Fill template
    const prompt = fillTemplate(template, contextVocab);
    
    return prompt;
}

// Get current context
function getCurrentContext() {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay;
    if (hour < 6) timeOfDay = 'night';
    else if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else if (hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const isWeekend = dayOfWeek === 'saturday' || dayOfWeek === 'sunday';
    
    // For demo, use random weather
    const weatherOptions = ['sunny', 'cloudy', 'rain', 'snow'];
    const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    
    return {
        timeOfDay,
        dayOfWeek,
        isWeekend,
        weather,
        date: now
    };
}

// Generate vocabulary based on context
function generateContextualVocabulary(context) {
    const vocab = {};
    
    // Base vocabulary - select random from each category
    Object.keys(vocabulary).forEach(key => {
        const words = vocabulary[key];
        vocab[key.slice(0, -1)] = words[Math.floor(Math.random() * words.length)];
    });
    
    // Apply weather modifiers
    if (contextModifiers.weather[context.weather]) {
        const weatherMods = contextModifiers.weather[context.weather];
        Object.keys(weatherMods).forEach(key => {
            const words = weatherMods[key];
            vocab[key.slice(0, -1)] = words[Math.floor(Math.random() * words.length)];
        });
    }
    
    // Apply time modifiers
    if (contextModifiers.timeOfDay[context.timeOfDay]) {
        const timeMods = contextModifiers.timeOfDay[context.timeOfDay];
        Object.keys(timeMods).forEach(key => {
            const words = timeMods[key];
            vocab[key.slice(0, -1)] = words[Math.floor(Math.random() * words.length)];
        });
    }
    
    // Add specific values for complex placeholders
    vocab.state1 = vocabulary.emotions[Math.floor(Math.random() * vocabulary.emotions.length)];
    vocab.state2 = vocabulary.emotions[Math.floor(Math.random() * vocabulary.emotions.length)];
    vocab.concept1 = vocabulary.concepts[Math.floor(Math.random() * vocabulary.concepts.length)];
    vocab.concept2 = vocabulary.concepts[Math.floor(Math.random() * vocabulary.concepts.length)];
    vocab.respond = vocabulary.verbs[Math.floor(Math.random() * vocabulary.verbs.length)];
    vocab.remains = ['remains', 'lingers', 'stays', 'persists'][Math.floor(Math.random() * 4)];
    
    return vocab;
}

// Fill template with vocabulary
function fillTemplate(template, vocab) {
    let prompt = template;
    
    // Find all placeholders
    const placeholders = template.match(/{(\w+)}/g);
    if (placeholders) {
        placeholders.forEach(placeholder => {
            const key = placeholder.replace(/{|}/g, '');
            const value = vocab[key] || key; // Use key as fallback
            prompt = prompt.replace(placeholder, value);
        });
    }
    
    // Capitalize first letter
    prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);
    
    return prompt;
}

// Load today's prompt (from Firebase or generate new)
async function loadTodayPrompt() {
    try {
        let prompt = null;
        
        // Try to get from Firebase if initialized
        if (window.firebaseFunctions && window.firebaseFunctions.isInitialized()) {
            prompt = await window.firebaseFunctions.getTodayPrompt();
        }
        
        // If no prompt exists, generate new one
        if (!prompt) {
            prompt = generateDailyPrompt();
            
            // Save to Firebase if possible
            if (window.firebaseFunctions && window.firebaseFunctions.isInitialized()) {
                await window.firebaseFunctions.saveDailyPrompt(prompt);
            }
        }
        
        // Update UI
        document.getElementById('daily-prompt').textContent = prompt;
        window.appFunctions.setCurrentPrompt(prompt);
        
        return prompt;
    } catch (error) {
        console.error('Error loading prompt:', error);
        
        // Fallback to generated prompt
        const prompt = generateDailyPrompt();
        document.getElementById('daily-prompt').textContent = prompt;
        window.appFunctions.setCurrentPrompt(prompt);
        
        return prompt;
    }
}

// Pre-generated prompts for specific events
const eventPrompts = {
    earthquake: [
        "Find where stillness lives after everything moves",
        "Document what didn't fall",
        "Show me the new cracks in familiar surfaces"
    ],
    snow: [
        "Show me what remains warm",
        "Document the city's first quiet",
        "Find color in the white"
    ],
    election: [
        "Where does hope wait?",
        "Document democracy without faces",
        "Show me the space between choices"
    ],
    weekend: [
        "Capture your version of rest",
        "Find Monday in Saturday",
        "Show me time without schedule"
    ]
};

// Get event-specific prompt if applicable
function getEventPrompt(eventType) {
    if (eventPrompts[eventType]) {
        const prompts = eventPrompts[eventType];
        return prompts[Math.floor(Math.random() * prompts.length)];
    }
    return null;
}

// Export functions
window.promptFunctions = {
    generateDailyPrompt,
    loadTodayPrompt,
    getEventPrompt,
    getCurrentContext
};

console.log('Prompt.js loaded');