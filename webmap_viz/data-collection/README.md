# Daily Ritual - Context-Based Data Collection

실제 날씨와 뉴스 데이터를 기반으로 프롬프트를 생성하고, Daily Ritual 프로토타입의 실제 사용자 응답을 시각화합니다.

## 🎯 시스템 구조

```
날씨 API + 뉴스 API → 컨텍스트 수집 → 프롬프트 생성
                                        ↓
Daily Ritual 프로토타입 (실제 사용자) → Firebase → 시각화
```

## 📁 파일 구조

- `context-collector.js` - 날씨/뉴스 API로 컨텍스트 수집
- `enhanced-prompt-generator.js` - 컨텍스트 기반 프롬프트 생성
- `main.js` - Firebase에서 실제 데이터 가져와서 시각화용 JSON 생성
- `collect.js` - (기존) 소셜 미디어 데이터 수집

## 🚀 설치 및 실행

### 1. 패키지 설치

```bash
cd webmap_viz/data-collection
npm install
```

### 2. API 키 설정

`.env.example` 파일을 `.env`로 복사하고 API 키를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```
APIFY_API_KEY=your_apify_api_key_here
WEATHER_API_KEY=your_openweather_api_key_here
NEWS_API_KEY=your_newsapi_key_here
```

**API 키 발급:**
- Apify: https://console.apify.com/account/integrations
- 날씨: https://openweathermap.org/api (무료)
- 뉴스: https://newsapi.org/ (무료)

**⚠️ 중요: `.env` 파일은 절대 Git에 커밋하지 마세요!**

### 3. Firebase 서비스 계정 키 설정

Firebase Console에서 서비스 계정 키를 다운로드하고 `firebase-service-account.json`으로 저장:

1. Firebase Console → Project Settings → Service Accounts
2. "Generate new private key" 클릭
3. 다운로드한 JSON 파일을 `firebase-service-account.json`으로 저장

### 4. 실행

```bash
# 컨텍스트 기반 프롬프트 생성 + Firebase 데이터 가져오기
npm run context
```

**출력 예시:**
```
🌟 Daily Ritual Context-Based Prompt Generation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Processing 2024-11-21
  🌤️  Weather: Clear (55°F)
  📰 News mood: neutral
  💭 Generated prompt: "Find poetry in the ordinary"
  📥 Fetching responses for 2024-11-21...
  ✅ Fetched 23 real responses

✅ Generated visualization data with 23 responses
📁 Saved to ../json/daily-ritual-live.json
```

## 📊 데이터 흐름

### 1. 프롬프트 생성 (자동)

```javascript
// 실제 날씨 + 뉴스 수집
const context = await collectDailyContext();

// 컨텍스트 기반 프롬프트 생성
const prompt = promptGenerator.generateFromContext(context);
// 예: "What warmth did you find in the cold?"
```

### 2. 사용자 응답 수집 (Daily Ritual 프로토타입)

사용자들이 Daily Ritual 웹사이트에서:
1. 프롬프트 확인
2. 사진 업로드
3. 키워드 입력
4. Firebase에 저장

### 3. 시각화 (webmap_viz)

```javascript
// Firebase에서 실제 데이터 로드
const realData = await loadFromFirebase();

// 지도에 표시
displayOnMap(realData);
```

## 🎨 시각화 확인

1. `webmap_viz/index.html` 열기
2. 자동으로 Firebase에서 실제 데이터 로드
3. 지도에 사용자 응답 표시 (블러 효과 + 사진 썸네일)

## 🔄 워크플로우

### 매일 아침 (자동화 가능):

```bash
# 1. 오늘의 컨텍스트 수집 + 프롬프트 생성
npm run context

# 2. Daily Ritual 프로토타입에 프롬프트 업데이트
# (Firebase에 저장하거나 웹사이트에 표시)

# 3. 사용자들이 하루 종일 응답 업로드

# 4. 저녁에 시각화 확인
# webmap_viz/index.html 열기
```

## 📝 데이터 구조

### 생성된 JSON 파일 (`daily-ritual-live.json`):

```json
{
  "2024-11-21": {
    "date": "2024-11-21",
    "prompt": "Find poetry in the ordinary",
    "context": {
      "weather": { "weather": "Clear", "temp": 55 },
      "news": "Regular day",
      "mood": "neutral"
    },
    "responses": [
      {
        "participantId": "user_abc123",
        "timestamp": "2024-11-21T14:30:00Z",
        "photo": "https://...",
        "thumbnail": "https://...",
        "keywords": ["coffee", "morning", "peaceful"],
        "location": { "lat": 40.7580, "lng": -73.9855, "name": "Times Square" },
        "timeOfDay": "afternoon"
      }
    ]
  }
}
```

## 🛠️ 트러블슈팅

### Firebase 연결 실패
- 서비스 계정 키 파일 확인
- Firebase 프로젝트 ID 확인

### API 키 오류
- API 키 유효성 확인
- API 사용량 제한 확인

### 데이터 없음
- Daily Ritual 프로토타입에서 실제 사용자 응답이 있는지 확인
- Firebase Console에서 `submissions` 컬렉션 확인

## 📌 참고

- 날씨 API는 현재 날씨만 제공 (과거 데이터는 유료)
- 뉴스 API는 최근 30일 데이터만 무료
- Firebase는 실시간으로 데이터 동기화

