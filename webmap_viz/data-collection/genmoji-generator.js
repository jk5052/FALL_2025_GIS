// Genmoji Generator - Server-side AI emoji generation using Hugging Face

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GenmojiGenerator {
    constructor() {
        this.HF_API_KEY = process.env.HF_API_KEY;
        
        if (!this.HF_API_KEY) {
            throw new Error('HF_API_KEY not found in .env file');
        }
        
        // 무료로 사용 가능한 고품질 모델들
        this.models = {
            // 이모지/스티커 스타일 - 가장 적합한 모델
            sticker: 'artificialguybr/StickersRedmond',  // 스티커 스타일
            emoji: 'Yntec/epiCPhotoGasm',                // 고품질 이미지
            cute: 'alvdansen/littletinies',              // 귀여운 미니 스타일
            abstract: 'plasmo/woolitize',                // 추상적 스타일
            simple: 'stabilityai/stable-diffusion-2-1'   // 안정적인 기본 모델
        };
        
        // 현재 사용 모델
        this.currentModel = this.models.sticker;
        
        // 출력 디렉토리
        this.outputDir = path.join(__dirname, '../images/genmojis');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        
        // 생성 통계
        this.stats = {
            total: 0,
            success: 0,
            failed: 0,
            cached: 0
        };
    }
    
    /**
     * 포스트 데이터로 젠모지 생성
     */
    async generateGenmoji(post, index) {
        const { text, hashtags, platform, timestamp } = post;
        
        // 파일명 생성 (고유 ID)
        const postId = `${platform}_${index}_${Date.parse(timestamp)}`;
        const filename = `${postId}.png`;
        const filepath = path.join(this.outputDir, filename);
        
        // 이미 생성된 경우 스킵
        if (fs.existsSync(filepath)) {
            console.log(`  ♻️  Cached: ${filename}`);
            this.stats.cached++;
            return `images/genmojis/${filename}`;
        }
        
        // 키워드 추출
        const keywords = this.extractKeywords(post);
        
        // 프롬프트 생성
        const prompt = this.createOptimizedPrompt(keywords, post);
        
        console.log(`  🎨 Generating: ${keywords.slice(0, 3).join(', ')}...`);
        
        try {
            // Hugging Face API 호출
            const imageBuffer = await this.callHuggingFaceAPI(prompt);
            
            // 이미지 저장
            fs.writeFileSync(filepath, imageBuffer);
            
            console.log(`  ✅ Saved: ${filename}`);
            this.stats.success++;
            this.stats.total++;
            
            return `images/genmojis/${filename}`;
            
        } catch (error) {
            console.error(`  ❌ Failed: ${error.message}`);
            this.stats.failed++;
            this.stats.total++;
            
            // 폴백: 기본 이모지 SVG 생성
            return this.generateFallbackGenmoji(keywords, filepath);
        }
    }
    
    /**
     * Hugging Face API 호출
     */
    async callHuggingFaceAPI(prompt, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(
                    `https://api-inference.huggingface.co/models/${this.currentModel}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.HF_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        method: 'POST',
                        body: JSON.stringify({
                            inputs: prompt,
                            parameters: {
                                negative_prompt: "realistic, photo, photograph, text, words, letters, watermark, signature, complex, detailed, ugly, blurry",
                                num_inference_steps: 25,
                                guidance_scale: 7.5,
                                width: 512,
                                height: 512
                            },
                            options: {
                                wait_for_model: true,
                                use_cache: false
                            }
                        }),
                    }
                );
                
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`API Error ${response.status}: ${error}`);
                }
                
                const buffer = await response.buffer();
                return buffer;
                
            } catch (error) {
                if (i === retries - 1) throw error;
                console.log(`    ⏳ Retry ${i + 1}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
            }
        }
    }
    
    /**
     * 키워드 추출
     */
    extractKeywords(post) {
        const keywords = new Set();
        
        // 해시태그에서
        if (post.hashtags && post.hashtags.length > 0) {
            post.hashtags.slice(0, 5).forEach(tag => {
                keywords.add(tag.toLowerCase().replace('#', ''));
            });
        }
        
        // 텍스트에서
        if (post.text) {
            const words = post.text.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 3 && w.length < 15);
            words.slice(0, 3).forEach(w => keywords.add(w));
        }
        
        // 플랫폼 추가
        keywords.add(post.platform);
        
        // NYC 관련
        keywords.add('nyc');

        return Array.from(keywords).slice(0, 8);
    }

    /**
     * 최적화된 프롬프트 생성 (젠모지 스타일)
     */
    createOptimizedPrompt(keywords, post) {
        // 감정 키워드 추출
        const emotions = this.extractEmotions(keywords);
        const objects = this.extractObjects(keywords);
        const timeOfDay = this.getTimeOfDay(post.timestamp);
        const colors = this.getColorScheme(timeOfDay, emotions);

        // 플랫폼별 스타일
        const platformStyles = {
            instagram: 'aesthetic minimalist',
            tiktok: 'dynamic playful',
            twitter: 'simple iconic',
            facebook: 'friendly warm'
        };

        const style = platformStyles[post.platform] || 'simple clean';
        const mainKeyword = keywords[0] || 'urban';
        const mood = emotions[0] || 'neutral';

        // 젠모지 스타일 프롬프트 템플릿
        const templates = [
            `cute ${mainKeyword} emoji sticker, ${mood} expression, ${style} style, ${colors.primary} color scheme, white background, flat design, simple shapes, vector art, no text`,
            `minimalist ${mainKeyword} icon, ${mood} mood, ${colors.primary} tones, ${style}, clean design, sticker style, white background, simple illustration`,
            `kawaii ${mainKeyword} character, ${mood} feeling, ${colors.primary} palette, ${style}, chibi style, white background, cute simple design`,
            `abstract ${mainKeyword} symbol, ${emotions.join(' ')} vibe, geometric shapes, ${colors.primary} colors, minimalist, sticker art, white background`
        ];

        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * 감정 키워드 추출
     */
    extractEmotions(keywords) {
        const emotionMap = {
            happy: ['happy', 'joy', 'excited', 'love', 'fun', 'smile', 'laugh'],
            calm: ['peaceful', 'calm', 'quiet', 'serene', 'zen', 'relax', 'chill'],
            sad: ['sad', 'lonely', 'melancholy', 'blue', 'down', 'miss'],
            anxious: ['anxious', 'worried', 'stressed', 'nervous', 'tense'],
            energetic: ['energy', 'active', 'dynamic', 'vibrant', 'busy', 'rush']
        };

        const found = [];
        keywords.forEach(keyword => {
            Object.entries(emotionMap).forEach(([emotion, words]) => {
                if (words.some(w => keyword.includes(w))) {
                    found.push(emotion);
                }
            });
        });

        return found.length > 0 ? found : ['urban', 'modern'];
    }

    /**
     * 객체 키워드 추출
     */
    extractObjects(keywords) {
        const objectMap = {
            urban: ['city', 'building', 'street', 'subway', 'taxi', 'bridge', 'skyline'],
            nature: ['tree', 'park', 'flower', 'sky', 'cloud', 'sun', 'rain', 'snow'],
            food: ['coffee', 'pizza', 'food', 'lunch', 'dinner', 'breakfast'],
            people: ['people', 'crowd', 'person', 'friend', 'family']
        };

        const found = [];
        keywords.forEach(keyword => {
            Object.entries(objectMap).forEach(([category, words]) => {
                if (words.some(w => keyword.includes(w))) {
                    found.push(category);
                }
            });
        });

        return found.length > 0 ? found : ['urban'];
    }

    /**
     * 시간대 추출
     */
    getTimeOfDay(timestamp) {
        const hour = new Date(timestamp).getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    /**
     * 시간대별 색상 스킴
     */
    getColorScheme(timeOfDay, emotions) {
        const schemes = {
            morning: { primary: 'warm yellow orange', secondary: 'soft pink', hex: '#FFB74D' },
            afternoon: { primary: 'bright blue sky', secondary: 'white', hex: '#42A5F5' },
            evening: { primary: 'purple pink sunset', secondary: 'orange', hex: '#AB47BC' },
            night: { primary: 'deep blue navy', secondary: 'silver', hex: '#5C6BC0' }
        };

        // 감정에 따른 조정
        if (emotions.includes('happy')) return { primary: 'bright yellow cheerful', secondary: 'orange', hex: '#FDD835' };
        if (emotions.includes('sad')) return { primary: 'soft blue gray', secondary: 'white', hex: '#90A4AE' };
        if (emotions.includes('anxious')) return { primary: 'orange red', secondary: 'yellow', hex: '#FF7043' };
        if (emotions.includes('calm')) return { primary: 'soft green mint', secondary: 'white', hex: '#81C784' };

        return schemes[timeOfDay] || schemes.afternoon;
    }

    /**
     * 폴백: 간단한 SVG 젠모지 생성
     */
    generateFallbackGenmoji(keywords, filepath) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const emoji = this.selectEmojiForKeywords(keywords);

        // 간단한 SVG 생성
        const svg = `
            <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                <circle cx="256" cy="256" r="240" fill="${color}" opacity="0.9"/>
                <text x="256" y="320" font-size="200" text-anchor="middle" fill="white">${emoji}</text>
            </svg>
        `;

        fs.writeFileSync(filepath.replace('.png', '.svg'), svg);
        return filepath.replace('.png', '.svg').replace(/^.*images/, 'images');
    }

    /**
     * 키워드에 맞는 이모지 선택
     */
    selectEmojiForKeywords(keywords) {
        const emojiMap = {
            happy: '😊', sad: '😢', love: '❤️', city: '🏙️',
            food: '🍕', coffee: '☕', rain: '🌧️', sun: '☀️',
            night: '🌙', morning: '🌅', park: '🌳', subway: '🚇'
        };

        for (const keyword of keywords) {
            for (const [key, emoji] of Object.entries(emojiMap)) {
                if (keyword.includes(key)) return emoji;
            }
        }

        return '✨'; // 기본 이모지
    }

    /**
     * 통계 출력
     */
    printStats() {
        console.log('\n📊 Genmoji Generation Statistics:');
        console.log(`   Total: ${this.stats.total}`);
        console.log(`   ✅ Success: ${this.stats.success}`);
        console.log(`   ♻️  Cached: ${this.stats.cached}`);
        console.log(`   ❌ Failed: ${this.stats.failed}`);
    }
}

export default GenmojiGenerator;

