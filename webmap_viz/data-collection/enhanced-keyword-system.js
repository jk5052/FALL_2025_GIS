// Enhanced Keyword System - Daily Ritual 스타일 프롬프트 생성

export const RITUAL_PROMPT_TEMPLATES = {
    // 공간과 감정
    spatial_emotional: [
        "Find {emotion} in the {space} between {object1} and {object2}",
        "Document where {feeling} {verb} when {condition}",
        "Show me the {quality} of {urban_element} at {time}",
        "Capture what {remains/escapes/arrives} in {transition}",
        "Frame {invisible} through {visible} {location}"
    ],
    
    // 시간과 변화
    temporal_transformation: [
        "What {transforms} between {time1} and {time2}?",
        "Document the {rhythm} of {collective_noun}",
        "Find what {persists} through {change}",
        "Show me {duration} compressed into {moment}",
        "Capture {yesterday}'s {promise} in {today}'s {reality}"
    ],
    
    // 도시와 개인
    urban_personal: [
        "Where does {personal} meet {public}?",
        "Find {solitude} in {crowd}",
        "Document {individual} {gesture} in {collective} {movement}",
        "Show me {intimacy} at {scale}",
        "Frame your {possession} against the city's {attribute}"
    ],
    
    // 물질과 비물질
    tangible_intangible: [
        "Make {abstract_concept} {physical_verb}",
        "Find the {weight} of {weightless}",
        "Document {ephemeral} becoming {permanent}",
        "Show me the {texture} of {emotion}",
        "Capture {memory} in {material}"
    ],
    
    // 리듬과 패턴
    rhythm_pattern: [
        "Document {number} {repetitions} of {ordinary}",
        "Find the {break} in {pattern}",
        "Show me where {routine} becomes {ritual}",
        "Capture {city}'s {heartbeat} at {specific_time}",
        "Frame {chaos} organizing into {order}"
    ]
};

export const EXPANDED_KEYWORD_MAP = {
    // 감정 스펙트럼 (세분화)
    emotions: {
        // 불안 계열
        'anxiety': ['anxious', 'nervous', 'worried', 'tense', 'uneasy', 'restless', 'agitated', 'stressed', 'overwhelmed', 'panic'],
        'uncertainty': ['uncertain', 'unsure', 'doubtful', 'confused', 'lost', 'questioning', 'wavering', 'hesitant', 'ambiguous'],
        'fear': ['scared', 'afraid', 'frightened', 'terrified', 'alarmed', 'spooked', 'dread', 'horror', 'phobia'],
        
        // 평온 계열
        'stillness': ['still', 'calm', 'quiet', 'peaceful', 'serene', 'tranquil', 'placid', 'composed', 'zen', 'meditative'],
        'peace': ['peaceful', 'harmony', 'balance', 'ease', 'comfort', 'relaxed', 'soothing', 'gentle', 'soft'],
        'silence': ['silent', 'mute', 'hushed', 'muffled', 'soundless', 'noiseless', 'quietude', 'hush'],
        
        // 기쁨 계열
        'joy': ['happy', 'joyful', 'cheerful', 'delighted', 'pleased', 'gleeful', 'jubilant', 'ecstatic', 'elated'],
        'excitement': ['excited', 'thrilled', 'energized', 'animated', 'enthusiastic', 'eager', 'pumped', 'hyped', 'buzzing'],
        'celebration': ['celebrate', 'party', 'festive', 'victory', 'triumph', 'success', 'achievement', 'milestone'],
        
        // 슬픔 계열
        'sadness': ['sad', 'melancholy', 'sorrow', 'grief', 'despair', 'depressed', 'down', 'blue', 'gloomy'],
        'loneliness': ['lonely', 'alone', 'isolated', 'solitary', 'abandoned', 'forsaken', 'empty', 'hollow'],
        'nostalgia': ['nostalgic', 'memory', 'remember', 'past', 'yesterday', 'childhood', 'reminisce', 'longing'],
        
        // 분노 계열
        'anger': ['angry', 'mad', 'furious', 'rage', 'irritated', 'annoyed', 'frustrated', 'pissed', 'livid'],
        'tension': ['tense', 'tight', 'strain', 'pressure', 'stress', 'conflict', 'friction', 'clash', 'confrontation'],
    },
    
    // 도시 요소 (NYC 특화)
    urban_elements: {
        'infrastructure': ['bridge', 'tunnel', 'subway', 'station', 'platform', 'tracks', 'terminal', 'port', 'highway', 'overpass'],
        'buildings': ['skyscraper', 'tower', 'brownstone', 'bodega', 'apartment', 'penthouse', 'rooftop', 'fire escape', 'lobby', 'stoop'],
        'streets': ['avenue', 'block', 'corner', 'intersection', 'crosswalk', 'sidewalk', 'alley', 'plaza', 'square', 'curb'],
        'spaces': ['park', 'playground', 'court', 'garden', 'pier', 'waterfront', 'market', 'gallery', 'museum', 'theater'],
        'transport': ['taxi', 'uber', 'citibike', 'mta', 'bus', 'train', 'ferry', 'helicopter', 'ambulance', 'delivery'],
        'landmarks': ['timessquare', 'centralpark', 'brooklyn', 'manhattan', 'queens', 'bronx', 'statenisland', 'hudson', 'eastriver']
    },
    
    // 시간 표현 (세밀화)
    temporal: {
        'dawn': ['dawn', 'daybreak', 'sunrise', 'firstlight', 'early', 'awakening', 'beginning', 'fresh', 'new'],
        'morning': ['morning', 'am', 'breakfast', 'coffee', 'commute', 'rush', 'routine', 'start', 'wake'],
        'noon': ['noon', 'midday', 'lunch', 'peak', 'bright', 'high', 'center', 'middle', 'apex'],
        'afternoon': ['afternoon', 'pm', 'teatime', 'siesta', 'slow', 'warm', 'lazy', 'declining', 'waning'],
        'dusk': ['dusk', 'twilight', 'sunset', 'golden', 'goldenhour', 'evening', 'dimming', 'fading', 'gloaming'],
        'night': ['night', 'nighttime', 'midnight', 'dark', 'nocturnal', 'moonlight', 'stars', 'late', 'afterhours'],
        'transitions': ['between', 'change', 'shift', 'transform', 'turn', 'become', 'evolve', 'morph', 'transition']
    },
    
    // 날씨/계절 (확장)
    weather: {
        'rain': ['rain', 'rainy', 'drizzle', 'pour', 'storm', 'thunder', 'lightning', 'wet', 'puddle', 'umbrella', 'raincoat', 'splash', 'drops', 'shower', 'downpour'],
        'snow': ['snow', 'snowing', 'blizzard', 'flurry', 'frost', 'ice', 'frozen', 'cold', 'winter', 'white', 'powder', 'slush', 'snowflake', 'snowstorm'],
        'sun': ['sunny', 'sunshine', 'bright', 'clear', 'warm', 'hot', 'heat', 'light', 'ray', 'beam', 'glow', 'radiant', 'brilliant', 'blazing'],
        'clouds': ['cloudy', 'overcast', 'gray', 'grey', 'fog', 'mist', 'haze', 'smog', 'murky', 'dim', 'dull', 'obscured', 'veiled'],
        'wind': ['windy', 'breeze', 'gust', 'blow', 'draft', 'air', 'flow', 'whirl', 'swirl', 'tornado', 'hurricane']
    },
    
    // 행동/동작 (다양화)
    actions: {
        'movement': ['walk', 'run', 'rush', 'hurry', 'stroll', 'wander', 'roam', 'drift', 'flow', 'dance', 'jump', 'climb', 'crawl'],
        'stillness': ['stand', 'sit', 'wait', 'pause', 'stop', 'freeze', 'rest', 'idle', 'linger', 'remain', 'stay', 'settle'],
        'observation': ['watch', 'look', 'see', 'observe', 'notice', 'witness', 'gaze', 'stare', 'glimpse', 'peek', 'spy', 'survey'],
        'interaction': ['meet', 'greet', 'talk', 'chat', 'discuss', 'argue', 'laugh', 'cry', 'hug', 'kiss', 'touch', 'connect'],
        'creation': ['make', 'create', 'build', 'draw', 'write', 'paint', 'photograph', 'capture', 'document', 'record', 'preserve']
    },
    
    // 감각 (오감)
    senses: {
        'visual': ['see', 'look', 'bright', 'dark', 'color', 'shade', 'shadow', 'light', 'blur', 'focus', 'clear', 'hazy'],
        'auditory': ['hear', 'listen', 'sound', 'noise', 'quiet', 'loud', 'echo', 'silence', 'music', 'voice', 'whisper', 'shout'],
        'tactile': ['touch', 'feel', 'texture', 'smooth', 'rough', 'soft', 'hard', 'warm', 'cold', 'wet', 'dry', 'sticky'],
        'olfactory': ['smell', 'scent', 'aroma', 'odor', 'fragrance', 'stench', 'perfume', 'fresh', 'musty', 'smoke'],
        'taste': ['taste', 'flavor', 'sweet', 'sour', 'bitter', 'salty', 'umami', 'spicy', 'bland', 'rich']
    },

    // 추상 개념 (확장)
    abstract: {
        'time': ['moment', 'instant', 'eternity', 'temporary', 'permanent', 'fleeting', 'lasting', 'duration', 'epoch', 'era'],
        'space': ['here', 'there', 'everywhere', 'nowhere', 'somewhere', 'distance', 'proximity', 'gap', 'void', 'expanse'],
        'existence': ['being', 'existence', 'presence', 'absence', 'reality', 'dream', 'imagination', 'truth', 'illusion', 'authentic'],
        'connection': ['together', 'apart', 'between', 'bridge', 'link', 'bond', 'tie', 'relationship', 'network', 'web'],
        'identity': ['self', 'other', 'us', 'them', 'individual', 'collective', 'personal', 'public', 'private', 'anonymous']
    },

    // 물질성 (텍스처/재질)
    materiality: {
        'textures': ['smooth', 'rough', 'soft', 'hard', 'sharp', 'blunt', 'fuzzy', 'silky', 'grainy', 'bumpy', 'slippery'],
        'materials': ['concrete', 'steel', 'glass', 'brick', 'wood', 'plastic', 'metal', 'stone', 'fabric', 'paper', 'water'],
        'states': ['solid', 'liquid', 'gas', 'frozen', 'melted', 'dissolved', 'evaporated', 'condensed', 'crystallized'],
        'qualities': ['transparent', 'opaque', 'translucent', 'reflective', 'matte', 'glossy', 'shiny', 'dull', 'luminous']
    },

    // 집단/개인 역학
    collective: {
        'crowd': ['crowd', 'mass', 'mob', 'gathering', 'assembly', 'congregation', 'audience', 'public', 'population', 'community'],
        'individual': ['alone', 'solo', 'single', 'one', 'person', 'individual', 'self', 'me', 'isolated', 'solitary'],
        'group': ['group', 'team', 'crew', 'gang', 'squad', 'family', 'friends', 'couple', 'pair', 'trio'],
        'dynamics': ['together', 'separate', 'unite', 'divide', 'merge', 'split', 'converge', 'diverge', 'scatter', 'gather']
    },

    // 리듬/패턴
    patterns: {
        'repetition': ['repeat', 'pattern', 'rhythm', 'cycle', 'loop', 'routine', 'habit', 'ritual', 'tradition', 'custom'],
        'interruption': ['break', 'interrupt', 'disrupt', 'pause', 'stop', 'halt', 'cease', 'gap', 'void', 'absence'],
        'flow': ['flow', 'stream', 'current', 'tide', 'wave', 'flux', 'movement', 'circulation', 'traffic', 'pulse'],
        'chaos': ['chaos', 'disorder', 'random', 'mess', 'confusion', 'tumult', 'turmoil', 'mayhem', 'anarchy', 'entropy']
    }
};

// Daily Ritual 스타일 프롬프트 생성기
export class RitualPromptGenerator {
    constructor() {
        this.templates = RITUAL_PROMPT_TEMPLATES;
        this.keywords = EXPANDED_KEYWORD_MAP;
    }

    generateRitualPrompt(context) {
        const { weather, news, timeOfDay, dayOfWeek, event } = context;

        // 컨텍스트에 맞는 템플릿 카테고리 선택
        let category = this.selectCategory(context);
        let template = this.selectTemplate(category);

        // 템플릿 채우기
        let prompt = this.fillTemplate(template, context);

        return {
            prompt: prompt,
            searchKeywords: this.extractSearchKeywords(prompt, context)
        };
    }

    selectCategory(context) {
        // 이벤트별 카테고리 매핑
        if (context.event?.includes('earthquake')) return 'spatial_emotional';
        if (context.event?.includes('election')) return 'urban_personal';
        if (context.event?.includes('snow')) return 'tangible_intangible';
        if (context.timeOfDay === 'morning') return 'rhythm_pattern';
        if (context.timeOfDay === 'evening') return 'temporal_transformation';

        // 랜덤 선택
        const categories = Object.keys(this.templates);
        return categories[Math.floor(Math.random() * categories.length)];
    }

    selectTemplate(category) {
        const templates = this.templates[category];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    fillTemplate(template, context) {
        let filled = template;

        // 각 플레이스홀더를 컨텍스트 기반으로 채우기
        const replacements = {
            '{emotion}': this.getRandomFromCategory('emotions', context),
            '{feeling}': this.getRandomFromCategory('emotions', context),
            '{space}': this.getRandomFromCategory('urban_elements.spaces'),
            '{urban_element}': this.getRandomFromCategory('urban_elements.infrastructure'),
            '{time}': context.timeOfDay || 'this moment',
            '{time1}': 'yesterday',
            '{time2}': 'today',
            '{verb}': this.getRandomFromCategory('actions.movement'),
            '{transforms}': ['shifts', 'changes', 'morphs', 'evolves', 'becomes'][Math.floor(Math.random() * 5)],
            '{remains}': 'remains',
            '{escapes}': 'escapes',
            '{arrives}': 'arrives',
            '{invisible}': this.getRandomFromCategory('abstract.existence'),
            '{visible}': this.getRandomFromCategory('materiality.materials'),
            '{quality}': this.getRandomFromCategory('materiality.qualities'),
            '{texture}': this.getRandomFromCategory('materiality.textures'),
            '{weight}': 'weight',
            '{weightless}': this.getRandomFromCategory('abstract.existence'),
            '{number}': ['three', 'five', 'seven', 'countless'][Math.floor(Math.random() * 4)],
            '{collective_noun}': this.getRandomFromCategory('collective.crowd'),
            '{individual}': 'individual',
            '{collective}': 'collective',
            '{personal}': 'personal',
            '{public}': 'public',
            '{solitude}': 'solitude',
            '{crowd}': 'crowd',
            '{abstract_concept}': this.getRandomFromCategory('abstract.existence'),
            '{physical_verb}': this.getRandomFromCategory('actions.creation'),
            '{ephemeral}': 'ephemeral',
            '{permanent}': 'permanent',
            '{memory}': 'memory',
            '{material}': this.getRandomFromCategory('materiality.materials'),
            '{ordinary}': 'ordinary',
            '{ritual}': 'ritual',
            '{routine}': 'routine',
            '{pattern}': 'pattern',
            '{chaos}': 'chaos',
            '{order}': 'order',
            '{city}': 'city',
            '{heartbeat}': 'heartbeat',
            '{specific_time}': context.timeOfDay || 'now',
            '{condition}': this.generateCondition(context),
            '{transition}': this.getRandomFromCategory('temporal.transitions'),
            '{location}': this.getRandomFromCategory('urban_elements.landmarks'),
            '{object1}': this.getRandomFromCategory('urban_elements.buildings'),
            '{object2}': this.getRandomFromCategory('urban_elements.infrastructure'),
            '{change}': 'change',
            '{moment}': 'moment',
            '{duration}': 'eternity',
            '{yesterday}': 'yesterday',
            '{today}': 'today',
            '{promise}': 'promise',
            '{reality}': 'reality',
            '{intimacy}': 'intimacy',
            '{scale}': 'scale',
            '{possession}': 'story',
            '{attribute}': 'rhythm',
            '{gesture}': this.getRandomFromCategory('actions.interaction'),
            '{movement}': this.getRandomFromCategory('actions.movement'),
            '{repetitions}': 'repetitions',
            '{break}': 'break',
            '{persists}': 'persists',
            '{rhythm}': 'rhythm'
        };

        // 모든 플레이스홀더 교체
        Object.entries(replacements).forEach(([placeholder, value]) => {
            if (filled.includes(placeholder)) {
                filled = filled.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
            }
        });

        // {A/B/C} 형태 처리
        filled = filled.replace(/{([^}]+)\/([^}]+)\/([^}]+)}/g, (match, a, b, c) => {
            const options = [a, b, c];
            return options[Math.floor(Math.random() * options.length)];
        });
        filled = filled.replace(/{([^}]+)\/([^}]+)}/g, (match, a, b) => {
            return Math.random() > 0.5 ? a : b;
        });

        return filled;
    }

    getRandomFromCategory(path, context) {
        const keys = path.split('.');
        let current = this.keywords;

        for (let key of keys) {
            if (current[key]) {
                current = current[key];
            } else {
                return key; // 폴백
            }
        }

        // 카테고리면 하위 선택
        if (typeof current === 'object' && !Array.isArray(current)) {
            const subKeys = Object.keys(current);
            const randomSubKey = subKeys[Math.floor(Math.random() * subKeys.length)];
            current = current[randomSubKey];
        }

        // 배열에서 랜덤 선택
        if (Array.isArray(current)) {
            return current[Math.floor(Math.random() * current.length)];
        }

        return current;
    }

    generateCondition(context) {
        const conditions = [
            'no one is watching',
            'everyone is looking',
            'the city sleeps',
            'the light changes',
            'silence falls',
            'chaos peaks',
            'time stops',
            'everything moves'
        ];

        // 컨텍스트 기반 조건
        if (context.weather?.weather === 'Rain') {
            conditions.push('rain begins', 'puddles form', 'umbrellas open');
        }
        if (context.timeOfDay === 'morning') {
            conditions.push('day begins', 'coffee brews', 'alarms sound');
        }
        if (context.timeOfDay === 'night') {
            conditions.push('darkness falls', 'lights emerge', 'streets empty');
        }

        return conditions[Math.floor(Math.random() * conditions.length)];
    }

    extractSearchKeywords(prompt, context) {
        const keywords = new Set(['nyc', 'manhattan', 'newyork']);
        const promptLower = prompt.toLowerCase();

        // 프롬프트에서 키워드 추출
        Object.entries(this.keywords).forEach(([category, subcategories]) => {
            Object.entries(subcategories).forEach(([subcat, words]) => {
                words.forEach(word => {
                    if (promptLower.includes(word) && word.length > 3) {
                        keywords.add(word);
                        // 관련 키워드도 추가
                        const related = words.slice(0, 3);
                        related.forEach(r => keywords.add(r));
                    }
                });
            });
        });

        // 컨텍스트 키워드
        if (context.weather?.weather) {
            const weatherKey = context.weather.weather.toLowerCase();
            const weatherKeys = this.keywords.weather[weatherKey] || [];
            weatherKeys.slice(0, 3).forEach(k => keywords.add(k));
        }

        if (context.timeOfDay) {
            const timeKeys = this.keywords.temporal[context.timeOfDay] || [];
            timeKeys.slice(0, 2).forEach(k => keywords.add(k));
        }

        // 이벤트 키워드
        if (context.event) {
            context.event.toLowerCase().split(' ').forEach(word => {
                if (word.length > 3) keywords.add(word);
            });
        }

        return Array.from(keywords).slice(0, 15); // 최대 15개
    }
}

export default { RITUAL_PROMPT_TEMPLATES, EXPANDED_KEYWORD_MAP, RitualPromptGenerator };

