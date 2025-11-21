// Context Collector - 실제 날씨 및 뉴스 데이터 수집
import axios from 'axios';

// API Keys (환경변수로 관리 권장)
const WEATHER_API_KEY = 'your_openweather_api_key'; // OpenWeatherMap
const NEWS_API_KEY = 'your_newsapi_key'; // NewsAPI

// NYC 좌표
const NYC_LAT = 40.7128;
const NYC_LNG = -74.0060;

/**
 * 날씨 데이터 수집 (OpenWeatherMap API)
 */
async function getWeatherData(date = new Date()) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${NYC_LAT}&lon=${NYC_LNG}&appid=${WEATHER_API_KEY}&units=imperial`;
        
        const response = await axios.get(url);
        const data = response.data;
        
        return {
            weather: data.weather[0].main, // Clear, Rain, Snow, etc.
            description: data.weather[0].description,
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Weather API error:', error.message);
        // Fallback to demo data
        return {
            weather: 'Clear',
            description: 'clear sky',
            temp: 55,
            feelsLike: 52,
            humidity: 60,
            windSpeed: 5,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 뉴스 데이터 수집 (NewsAPI)
 */
async function getNewsData(date = new Date()) {
    try {
        const dateStr = date.toISOString().split('T')[0];
        const url = `https://newsapi.org/v2/everything?q=NYC OR "New York"&from=${dateStr}&to=${dateStr}&sortBy=popularity&apiKey=${NEWS_API_KEY}&pageSize=10`;
        
        const response = await axios.get(url);
        const articles = response.data.articles;
        
        // 주요 이벤트 추출
        const mainEvent = extractMainEvent(articles);
        const mood = analyzeMood(articles);
        
        return {
            mainEvent: mainEvent,
            mood: mood, // positive, neutral, negative
            headlines: articles.slice(0, 5).map(a => a.title),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('News API error:', error.message);
        // Fallback
        return {
            mainEvent: null,
            mood: 'neutral',
            headlines: [],
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 주요 이벤트 추출
 */
function extractMainEvent(articles) {
    if (!articles || articles.length === 0) return null;
    
    // 키워드 빈도 분석
    const keywords = {};
    const eventKeywords = ['election', 'protest', 'storm', 'snow', 'heat', 'strike', 'celebration', 'parade', 'earthquake', 'fire'];
    
    articles.forEach(article => {
        const text = (article.title + ' ' + article.description).toLowerCase();
        eventKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                keywords[keyword] = (keywords[keyword] || 0) + 1;
            }
        });
    });
    
    // 가장 많이 언급된 키워드
    const topKeyword = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])[0];
    
    return topKeyword ? topKeyword[0] : null;
}

/**
 * 뉴스 감정 분석
 */
function analyzeMood(articles) {
    if (!articles || articles.length === 0) return 'neutral';
    
    const positiveWords = ['celebrate', 'win', 'success', 'joy', 'festival', 'victory', 'achievement'];
    const negativeWords = ['crisis', 'death', 'tragedy', 'accident', 'crime', 'protest', 'conflict'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    articles.forEach(article => {
        const text = (article.title + ' ' + article.description).toLowerCase();
        positiveWords.forEach(word => {
            if (text.includes(word)) positiveCount++;
        });
        negativeWords.forEach(word => {
            if (text.includes(word)) negativeCount++;
        });
    });
    
    if (positiveCount > negativeCount * 1.5) return 'positive';
    if (negativeCount > positiveCount * 1.5) return 'negative';
    return 'neutral';
}

/**
 * 전체 컨텍스트 수집
 */
export async function collectDailyContext(date = new Date()) {
    console.log('🌍 Collecting daily context...');
    
    const [weather, news] = await Promise.all([
        getWeatherData(date),
        getNewsData(date)
    ]);
    
    const now = new Date(date);
    const hour = now.getHours();
    
    return {
        date: now.toISOString().split('T')[0],
        weather: weather,
        news: news,
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        timeOfDay: getTimeOfDay(hour),
        timestamp: now.toISOString()
    };
}

function getTimeOfDay(hour) {
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

