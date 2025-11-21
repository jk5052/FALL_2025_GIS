// Enhanced Prompt Generator - 컨텍스트 기반 프롬프트 생성

export class EnhancedPromptGenerator {
    constructor() {
        // 날씨별 프롬프트 템플릿
        this.weatherPrompts = {
            'Clear': [
                "What moment of clarity did you find today?",
                "Capture the light that caught your eye",
                "Find beauty in the ordinary sunshine"
            ],
            'Rain': [
                "What sheltered you today?",
                "Find poetry in the rain",
                "Capture reflections in the wet streets"
            ],
            'Snow': [
                "What warmth did you find in the cold?",
                "Document the quiet of snowfall",
                "Capture winter's transformation"
            ],
            'Clouds': [
                "What emerged from the gray?",
                "Find color in the overcast",
                "Document the soft light"
            ],
            'Storm': [
                "What remained steady in the chaos?",
                "Capture the power of nature",
                "Find shelter and document it"
            ]
        };
        
        // 기온별 프롬프트
        this.temperaturePrompts = {
            'hot': [
                "Where did you find cool relief?",
                "Capture summer's energy",
                "Document the heat haze"
            ],
            'warm': [
                "What made you comfortable today?",
                "Capture the pleasant moments",
                "Find ease in the warmth"
            ],
            'cool': [
                "What kept you cozy?",
                "Document autumn's colors",
                "Capture the crisp air"
            ],
            'cold': [
                "Where did you find warmth?",
                "Capture winter's beauty",
                "Document the frost and ice"
            ]
        };
        
        // 뉴스 감정별 프롬프트
        this.moodPrompts = {
            'positive': [
                "What joy did you witness today?",
                "Capture the celebration around you",
                "Document hope in your neighborhood"
            ],
            'negative': [
                "What resilience did you see?",
                "Find light in difficult times",
                "Document community strength"
            ],
            'neutral': [
                "What caught your attention today?",
                "Find poetry in the ordinary",
                "Capture your daily ritual"
            ]
        };
        
        // 시간대별 프롬프트
        this.timePrompts = {
            'morning': [
                "How does your day begin?",
                "Capture the morning light",
                "Document your morning ritual"
            ],
            'afternoon': [
                "What energizes your afternoon?",
                "Capture the midday moment",
                "Find pause in the busy hours"
            ],
            'evening': [
                "How does your day wind down?",
                "Capture the golden hour",
                "Document the transition to night"
            ],
            'night': [
                "What lights your darkness?",
                "Capture the city at night",
                "Find beauty in the nocturnal"
            ]
        };
    }
    
    /**
     * 컨텍스트 기반 프롬프트 생성
     */
    generateFromContext(context) {
        const prompts = [];
        
        // 날씨 기반
        const weather = context.weather.weather;
        if (this.weatherPrompts[weather]) {
            prompts.push(...this.weatherPrompts[weather]);
        }
        
        // 기온 기반
        const temp = context.weather.temp;
        let tempCategory;
        if (temp > 80) tempCategory = 'hot';
        else if (temp > 60) tempCategory = 'warm';
        else if (temp > 40) tempCategory = 'cool';
        else tempCategory = 'cold';
        
        if (this.temperaturePrompts[tempCategory]) {
            prompts.push(...this.temperaturePrompts[tempCategory]);
        }
        
        // 뉴스 감정 기반
        const mood = context.news.mood;
        if (this.moodPrompts[mood]) {
            prompts.push(...this.moodPrompts[mood]);
        }
        
        // 시간대 기반
        const timeOfDay = context.timeOfDay;
        if (this.timePrompts[timeOfDay]) {
            prompts.push(...this.timePrompts[timeOfDay]);
        }
        
        // 랜덤 선택
        const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        
        return selectedPrompt || "What moment defined your day?";
    }
    
    /**
     * 특정 이벤트 기반 프롬프트
     */
    generateForEvent(eventName) {
        const eventPrompts = {
            'election': "How does democracy look in your neighborhood?",
            'snow': "Capture winter's first touch",
            'storm': "What remained steady in the storm?",
            'heat': "Where did you find cool relief?",
            'protest': "Document the voice of the city",
            'celebration': "Capture the joy around you",
            'earthquake': "What shook your world today?",
            'eclipse': "Witness the cosmic moment"
        };
        
        return eventPrompts[eventName] || this.generateFromContext({ 
            weather: { weather: 'Clear', temp: 60 },
            news: { mood: 'neutral' },
            timeOfDay: 'afternoon'
        });
    }
}

