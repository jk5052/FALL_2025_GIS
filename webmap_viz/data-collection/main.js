// Main Script - 컨텍스트 기반 프롬프트 생성 및 Daily Ritual 데이터 연동

import { collectDailyContext } from './context-collector.js';
import { EnhancedPromptGenerator } from './enhanced-prompt-generator.js';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Admin 초기화 (서비스 계정 키 필요)
// 참고: Firebase Console > Project Settings > Service Accounts에서 키 다운로드
let db = null;

function initializeFirebase() {
    try {
        // 서비스 계정 키 파일 경로
        const serviceAccount = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8')
        );
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: 'daily-ritual-nyc.firebasestorage.app'
        });
        
        db = admin.firestore();
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        console.log('⚠️  Running without Firebase connection');
    }
}

/**
 * Daily Ritual에서 실제 사용자 응답 가져오기
 */
async function fetchDailyRitualResponses(date) {
    if (!db) {
        console.log('  ⚠️  No Firebase connection, using demo data');
        return generateDemoResponses();
    }
    
    try {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        console.log(`  📥 Fetching responses for ${dateStr}...`);
        
        // Firestore에서 해당 날짜의 응답 가져오기
        const snapshot = await db.collection('submissions')
            .where('date', '==', dateStr)
            .get();
        
        if (snapshot.empty) {
            console.log('  ⚠️  No responses found, using demo data');
            return generateDemoResponses();
        }
        
        const responses = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            responses.push({
                participantId: doc.id,
                timestamp: data.timestamp,
                photo: data.photoURL,
                thumbnail: data.thumbnailURL || data.photoURL,
                keywords: data.keywords || [],
                location: {
                    lat: data.location?.lat || 40.7128 + (Math.random() - 0.5) * 0.1,
                    lng: data.location?.lng || -74.0060 + (Math.random() - 0.5) * 0.1,
                    name: data.location?.name || 'Manhattan'
                },
                timeOfDay: data.timeOfDay || getTimeOfDay(new Date(data.timestamp))
            });
        });
        
        console.log(`  ✅ Fetched ${responses.length} real responses`);
        return responses;
        
    } catch (error) {
        console.error('  ❌ Error fetching responses:', error.message);
        return generateDemoResponses();
    }
}

/**
 * 데모 응답 생성 (Firebase 연결 실패 시)
 */
function generateDemoResponses() {
    const demoLocations = [
        { lat: 40.7580, lng: -73.9855, name: 'Times Square' },
        { lat: 40.7614, lng: -73.9776, name: 'Central Park' },
        { lat: 40.7484, lng: -73.9857, name: 'Empire State Building' },
        { lat: 40.7061, lng: -74.0087, name: 'Financial District' },
        { lat: 40.7282, lng: -73.7949, name: 'Brooklyn' }
    ];
    
    return Array.from({ length: 10 }, (_, i) => {
        const loc = demoLocations[i % demoLocations.length];
        return {
            participantId: `demo_user_${i}`,
            timestamp: new Date().toISOString(),
            photo: `https://picsum.photos/800/600?random=${i}`,
            thumbnail: `https://picsum.photos/200/150?random=${i}`,
            keywords: ['demo', 'test', 'nyc'],
            location: {
                lat: loc.lat + (Math.random() - 0.5) * 0.01,
                lng: loc.lng + (Math.random() - 0.5) * 0.01,
                name: loc.name
            },
            timeOfDay: getTimeOfDay(new Date())
        };
    });
}

/**
 * 메인 실행 함수
 */
async function generateDailyRitualWithContext() {
    console.log('🌟 Daily Ritual Context-Based Prompt Generation\n');
    console.log('━'.repeat(60));
    
    // Firebase 초기화
    initializeFirebase();
    
    const promptGenerator = new EnhancedPromptGenerator();
    const today = new Date().toISOString().split('T')[0];
    
    try {
        console.log(`\n📅 Processing ${today}`);
        
        // 1. 컨텍스트 수집 (날씨 + 뉴스)
        const context = await collectDailyContext(today);
        console.log(`  🌤️  Weather: ${context.weather.weather} (${context.weather.temp}°F)`);
        console.log(`  📰 News mood: ${context.news.mood}`);
        if (context.news.mainEvent) {
            console.log(`  📌 Main event: ${context.news.mainEvent}`);
        }
        
        // 2. 컨텍스트 기반 프롬프트 생성
        const prompt = promptGenerator.generateFromContext(context);
        console.log(`  💭 Generated prompt: "${prompt}"`);
        
        // 3. Daily Ritual에서 실제 사용자 응답 가져오기
        const responses = await fetchDailyRitualResponses(today);
        
        // 4. 시각화용 데이터 구조로 변환
        const visualizationData = {
            date: today,
            prompt: prompt,
            context: {
                weather: context.weather,
                news: context.news.mainEvent || 'Regular day',
                mood: context.news.mood,
                dayOfWeek: context.dayOfWeek,
                timeOfDay: context.timeOfDay
            },
            responses: responses,
            statistics: {
                totalResponses: responses.length,
                weather: context.weather.weather,
                temperature: context.weather.temp,
                newsMood: context.news.mood
            }
        };
        
        // 5. 파일 저장
        const outputDir = path.join(__dirname, '../json');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, 'daily-ritual-live.json');
        fs.writeFileSync(outputPath, JSON.stringify({ [today]: visualizationData }, null, 2));
        
        console.log(`\n✅ Generated visualization data with ${responses.length} responses`);
        console.log(`📁 Saved to ${outputPath}`);
        console.log(`\n🎨 Use this file in webmap_viz for visualization!`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (db) {
            await admin.app().delete();
        }
    }
}

function getTimeOfDay(date) {
    const hour = new Date(date).getHours();
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

// 실행
generateDailyRitualWithContext();

