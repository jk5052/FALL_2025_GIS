// Global data storage
let currentData = null;

// Firebase configuration (same as daily-ritual)
const firebaseConfig = {
    apiKey: "AIzaSyDHoRfZH9AA4nhu28jvJ-SvChINyg3-yGM",
    authDomain: "daily-ritual-nyc.firebaseapp.com",
    projectId: "daily-ritual-nyc",
    storageBucket: "daily-ritual-nyc.firebasestorage.app",
    messagingSenderId: "1068466601428",
    appId: "1:1068466601428:web:8ae553727f86959ddbea41",
    measurementId: "G-9C5T72REN3"
};

// Initialize Firebase
let db = null;

function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        console.log('✅ Firebase initialized for visualization');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        db = null;
    }
}

// Load data - try Firebase first, then fallback to JSON
async function loadData() {
    console.log('📊 Loading Daily Ritual data...');

    // Initialize Firebase
    initializeFirebase();

    // Try loading from Firebase (real data)
    if (db) {
        try {
            const realData = await loadFromFirebase();
            if (realData && Object.keys(realData).length > 0) {
                currentData = realData;
                console.log('✅ Loaded real data from Firebase:', Object.keys(realData).length, 'days');
                return;
            }
        } catch (error) {
            console.error('⚠️  Firebase load failed:', error.message);
        }
    }

    // Fallback to JSON file
    try {
        console.log('📁 Loading from JSON file...');
        const response = await fetch('json/daily-ritual-live.json');
        const data = await response.json();
        currentData = data;
        console.log('✅ Loaded data from JSON:', Object.keys(data).length, 'days');
    } catch (error) {
        console.error('⚠️  JSON load failed:', error.message);
        // Final fallback to demo data
        currentData = generateDemoData();
        console.log('⚠️  Using demo data');
    }
}

// Load real data from Firebase
async function loadFromFirebase() {
    console.log('  🔥 Fetching from Firebase...');

    try {
        // Get all submissions grouped by date
        const snapshot = await db.collection('submissions')
            .orderBy('timestamp', 'desc')
            .limit(100) // Last 100 submissions
            .get();

        if (snapshot.empty) {
            console.log('  ⚠️  No submissions found');
            return null;
        }

        // Group by date
        const dataByDate = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date || new Date(data.timestamp).toISOString().split('T')[0];

            if (!dataByDate[date]) {
                dataByDate[date] = {
                    date: date,
                    prompt: data.prompt || "What moment defined your day?",
                    responses: []
                };
            }

            dataByDate[date].responses.push({
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

        console.log(`  ✅ Loaded ${Object.keys(dataByDate).length} days with ${snapshot.size} responses`);
        return dataByDate;

    } catch (error) {
        console.error('  ❌ Firebase query error:', error);
        return null;
    }
}

// Generate demo data if all loading fails
function generateDemoData() {
    const today = new Date().toISOString().split('T')[0];
    const demoLocations = [
        { lat: 40.7580, lng: -73.9855, name: 'Times Square' },
        { lat: 40.7614, lng: -73.9776, name: 'Central Park' },
        { lat: 40.7484, lng: -73.9857, name: 'Empire State Building' }
    ];

    return {
        [today]: {
            date: today,
            prompt: "What moment defined your day?",
            responses: Array.from({ length: 5 }, (_, i) => {
                const loc = demoLocations[i % demoLocations.length];
                return {
                    participantId: `demo_${i}`,
                    timestamp: new Date().toISOString(),
                    photo: `https://picsum.photos/800/600?random=${i}`,
                    thumbnail: `https://picsum.photos/200/150?random=${i}`,
                    keywords: ['demo', 'test'],
                    location: {
                        lat: loc.lat + (Math.random() - 0.5) * 0.01,
                        lng: loc.lng + (Math.random() - 0.5) * 0.01,
                        name: loc.name
                    },
                    timeOfDay: 'afternoon'
                };
            })
        }
    };
}

function getTimeOfDay(date) {
    const hour = new Date(date).getHours();
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});