// Daily Ritual - Prompt Generation System
// Generates contextual prompts based on date, weather, events, and mood

export class DailyPromptGenerator {
    constructor() {
        // Template structures for different types of prompts
        this.templates = {
            observation: [
                "Notice the {quality} of {subject} today",
                "Find where {emotion} {verb} in the {timeframe}",
                "Document the {texture} between {state1} and {state2}",
                "Show me what {concept} looks like when {condition}"
            ],
            question: [
                "What {verb} when no one is {watching_state}?",
                "Where does {abstract} live in your {timeframe}?",
                "How many {units} of {feeling} fit in {container}?",
                "What color is {concept} at {time}?"
            ],
            instruction: [
                "Capture {number} moments of {quality}",
                "Frame the {invisible} through the {visible}",
                "Show me your {possession} without showing your {mask}",
                "Find the {emotion} hiding in {ordinary_place}"
            ],
            poetic: [
                "{verb_present} where {subject} {verb_past}",
                "Between {concept1} and {concept2}, find {discovery}",
                "The {timeframe} holds {quantity} of {abstract}",
                "What {remains} after {event_metaphor}?"
            ]
        };
        
        // Vocabulary banks organized by category
        this.vocabulary = {
            emotions: {
                anxious: ['trembling', 'uncertain', 'restless', 'wavering', 'suspended'],
                excited: ['electric', 'vibrating', 'rushing', 'bursting', 'radiating'],
                peaceful: ['still', 'settled', 'gentle', 'soft', 'quiet'],
                chaotic: ['scattered', 'tangled', 'spinning', 'fractured', 'colliding'],
                reflective: ['echoing', 'remembering', 'lingering', 'returning', 'circling']
            },
            
            qualities: ['weight', 'texture', 'rhythm', 'temperature', 'velocity', 'density', 'frequency'],
            
            subjects: ['shadows', 'strangers', 'reflections', 'corners', 'thresholds', 'distances', 'pauses'],
            
            concepts: ['home', 'belonging', 'tomorrow', 'silence', 'permission', 'forgetting', 'becoming'],
            
            verbs: {
                present: ['breathes', 'accumulates', 'dissolves', 'persists', 'unfolds', 'gathers'],
                past: ['settled', 'escaped', 'remained', 'transformed', 'disappeared', 'arrived']
            },
            
            timeframes: ['morning', 'afternoon', 'evening', 'twilight', 'dawn', 'midnight', 'now'],
            
            containers: ['one block', 'a glance', 'this moment', 'your pocket', 'the commute', 'a breath'],
            
            ordinary_places: ['the subway', 'your coffee', 'the crosswalk', 'the elevator', 'the queue', 'the sidewalk']
        };
        
        // Event-specific vocabulary modifications
        this.eventModifiers = {
            'Earthquake': {
                subjects: ['cracks', 'foundations', 'stillness', 'solid ground'],
                verbs: ['shakes', 'settles', 'holds', 'fractures'],
                concepts: ['stability', 'permanence', 'ground', 'balance']
            },
            'Solar Eclipse': {
                subjects: ['shadows', 'light', 'darkness', 'alignment'],
                verbs: ['covers', 'reveals', 'aligns', 'transforms'],
                concepts: ['totality', 'rarity', 'cosmos', 'wonder']
            },
            'Election Day': {
                subjects: ['choices', 'voices', 'divisions', 'futures'],
                verbs: ['decides', 'divides', 'unites', 'waits'],
                concepts: ['democracy', 'tomorrow', 'power', 'hope']
            },
            'First Snow': {
                subjects: ['blankets', 'crystals', 'quiet', 'transformation'],
                verbs: ['covers', 'muffles', 'transforms', 'arrives'],
                concepts: ['silence', 'childhood', 'warmth', 'change']
            },
            'Heat Wave': {
                subjects: ['weight', 'thickness', 'exhaustion', 'refuge'],
                verbs: ['melts', 'demands', 'exhausts', 'shimmers'],
                concepts: ['endurance', 'escape', 'survival', 'inequality']
            }
        };
        
        // Mood-based template preferences
        this.moodTemplates = {
            anxious: ['question', 'observation'],
            excited: ['instruction', 'poetic'],
            peaceful: ['observation', 'poetic'],
            chaotic: ['question', 'instruction'],
            reflective: ['poetic', 'observation'],
            neutral: ['observation', 'instruction']
        };
    }
    
    // Main prompt generation method
    generatePrompt(context) {
        const { date, event, mood = 'neutral', dayOfWeek, postCount } = context;
        
        // Select template category based on mood
        const templateCategories = this.moodTemplates[mood] || this.moodTemplates.neutral;
        const selectedCategory = templateCategories[Math.floor(Math.random() * templateCategories.length)];
        
        // Select specific template
        const templates = this.templates[selectedCategory];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // Generate vocabulary based on context
        const vocab = this.generateContextualVocabulary(event, mood, dayOfWeek);
        
        // Fill template with vocabulary
        const prompt = this.fillTemplate(template, vocab);
        
        return prompt;
    }
    
    // Generate vocabulary specific to context
    generateContextualVocabulary(event, mood, dayOfWeek) {
        const vocab = {};
        
        // Start with base vocabulary
        Object.keys(this.vocabulary).forEach(key => {
            if (Array.isArray(this.vocabulary[key])) {
                vocab[key] = this.selectRandom(this.vocabulary[key]);
            } else if (typeof this.vocabulary[key] === 'object') {
                // Handle nested vocabulary (like emotions, verbs)
                if (this.vocabulary[key][mood]) {
                    vocab[key] = this.selectRandom(this.vocabulary[key][mood]);
                } else {
                    // Select from any category
                    const categories = Object.values(this.vocabulary[key]);
                    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                    vocab[key] = this.selectRandom(randomCategory);
                }
            }
        });
        
        // Add verb variations
        vocab.verb = this.selectRandom(this.vocabulary.verbs.present);
        vocab.verb_present = vocab.verb;
        vocab.verb_past = this.selectRandom(this.vocabulary.verbs.past);
        
        // Modify based on event
        if (this.eventModifiers[event]) {
            const modifiers = this.eventModifiers[event];
            Object.entries(modifiers).forEach(([key, values]) => {
                vocab[key] = this.selectRandom(values);
            });
        }
        
        // Add specific values
        vocab.quality = this.selectRandom(this.vocabulary.qualities);
        vocab.emotion = vocab.emotions || this.selectRandom(['stillness', 'movement', 'change', 'presence']);
        vocab.subject = vocab.subjects || this.selectRandom(this.vocabulary.subjects);
        vocab.concept = vocab.concepts || this.selectRandom(this.vocabulary.concepts);
        vocab.timeframe = this.getTimeframe(dayOfWeek);
        vocab.time = vocab.timeframe;
        
        // Add paired concepts
        vocab.state1 = this.selectRandom(['arriving', 'leaving', 'staying', 'passing']);
        vocab.state2 = this.selectRandom(['remaining', 'forgetting', 'remembering', 'becoming']);
        vocab.concept1 = this.selectRandom(this.vocabulary.concepts);
        vocab.concept2 = this.selectRandom(this.vocabulary.concepts.filter(c => c !== vocab.concept1));
        
        // Add quantities
        vocab.number = this.selectRandom(['three', 'five', 'seven', 'countless', 'enough']);
        vocab.quantity = this.selectRandom(['traces', 'fragments', 'layers', 'echoes']);
        vocab.units = vocab.quantity;
        
        // Add descriptors
        vocab.texture = this.selectRandom(['smooth', 'rough', 'soft', 'sharp', 'blurred']);
        vocab.invisible = this.selectRandom(['unseen', 'unspoken', 'untold', 'unfelt']);
        vocab.visible = this.selectRandom(['obvious', 'surface', 'shown', 'displayed']);
        vocab.feeling = vocab.emotion;
        vocab.container = this.selectRandom(this.vocabulary.containers);
        vocab.ordinary_place = this.selectRandom(this.vocabulary.ordinary_places);
        
        // Add conditions and states
        vocab.watching_state = this.selectRandom(['watching', 'looking', 'paying attention', 'noticing']);
        vocab.condition = this.selectRandom(['nobody sees', 'everyone knows', 'nothing matters', 'everything changes']);
        vocab.possession = this.selectRandom(['story', 'truth', 'fear', 'hope', 'secret']);
        vocab.mask = this.selectRandom(['smile', 'calm', 'confidence', 'indifference']);
        
        // Add abstract concepts
        vocab.abstract = this.selectRandom(['meaning', 'purpose', 'connection', 'distance']);
        vocab.discovery = this.selectRandom(['truth', 'peace', 'yourself', 'nothing', 'everything']);
        vocab.remains = this.selectRandom(['remains', 'lingers', 'stays', 'persists']);
        vocab.event_metaphor = this.selectRandom(['the dust settles', 'the crowd disperses', 'the moment passes', 'everything moves']);
        
        return vocab;
    }
    
    // Get timeframe based on day of week
    getTimeframe(dayOfWeek) {
        const timeframes = {
            'Monday': 'beginning',
            'Tuesday': 'momentum',
            'Wednesday': 'middle',
            'Thursday': 'anticipation',
            'Friday': 'release',
            'Saturday': 'expansion',
            'Sunday': 'pause'
        };
        return timeframes[dayOfWeek] || 'moment';
    }
    
    // Fill template with vocabulary
    fillTemplate(template, vocab) {
        let prompt = template;
        
        // Replace all placeholders
        const placeholders = template.match(/{(\w+)}/g);
        if (placeholders) {
            placeholders.forEach(placeholder => {
                const key = placeholder.replace(/{|}/g, '');
                const value = vocab[key] || this.getDefaultValue(key);
                prompt = prompt.replace(placeholder, value);
            });
        }
        
        // Capitalize first letter
        prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);
        
        return prompt;
    }
    
    // Get default value for missing vocabulary
    getDefaultValue(key) {
        const defaults = {
            quality: 'essence',
            subject: 'moment',
            emotion: 'feeling',
            verb: 'exists',
            concept: 'today',
            timeframe: 'now',
            abstract: 'meaning'
        };
        return defaults[key] || key;
    }
    
    // Helper to select random item from array
    selectRandom(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Generate prompts for specific events
    generateEventPrompt(event) {
        const eventPrompts = {
            'Earthquake': [
                "Find where stillness lives after everything moves",
                "Document what didn't fall",
                "Show me the new cracks in familiar surfaces"
            ],
            'Solar Eclipse': [
                "Capture three shadows that don't belong to you",
                "What changes when the light returns?",
                "Document the moment between day and night"
            ],
            'Election Day': [
                "Where does hope wait in line?",
                "Show me democracy without showing faces",
                "What accumulates between choices?"
            ],
            'First Snow': [
                "Find what remains warm",
                "Document the city's first quiet",
                "Show me transformation without movement"
            ]
        };
        
        if (eventPrompts[event]) {
            return this.selectRandom(eventPrompts[event]);
        }
        
        // Generate using template system if no specific prompt
        return this.generatePrompt({ event, mood: 'reflective' });
    }
    
    // Generate a series of related prompts
    generatePromptSeries(context, count = 7) {
        const prompts = [];
        const usedTemplates = new Set();
        
        for (let i = 0; i < count; i++) {
            let prompt;
            let attempts = 0;
            
            // Try to generate unique prompts
            do {
                prompt = this.generatePrompt(context);
                attempts++;
            } while (usedTemplates.has(prompt) && attempts < 10);
            
            usedTemplates.add(prompt);
            prompts.push({
                day: i + 1,
                prompt: prompt,
                context: { ...context, dayNumber: i + 1 }
            });
        }
        
        return prompts;
    }
}

// Export for use in other modules
export default DailyPromptGenerator;