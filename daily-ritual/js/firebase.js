// Daily Ritual - Firebase Configuration and Operations

// Firebase configuration
// Note: Firebase client config is safe to expose publicly (it's designed to be public)
// Security is handled by Firebase Security Rules, not by hiding the config
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
let storage = null;

function initializeFirebase() {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        db = firebase.firestore();
        
        // Initialize Storage
        storage = firebase.storage();
        
        console.log('Firebase initialized successfully');
        
        // Enable offline persistence
        db.enablePersistence()
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (err.code === 'unimplemented') {
                    console.log('The current browser does not support offline persistence');
                }
            });
            
    } catch (error) {
        console.error('Firebase initialization error:', error);
        // Fall back to demo mode
        window.appFunctions.isDemo = () => true;
    }
}

// Save submission to Firestore
async function saveSubmission(submissionData) {
    if (!db) {
        console.error('Firebase not initialized');
        return null;
    }
    
    try {
        // Add timestamp
        submissionData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        submissionData.created_at = new Date().toISOString();
        
        // Save to Firestore
        const docRef = await db.collection('submissions').add(submissionData);
        console.log('Submission saved with ID:', docRef.id);
        
        return docRef.id;
    } catch (error) {
        console.error('Error saving submission:', error);
        throw error;
    }
}

// Upload photo to Firebase Storage
async function uploadPhoto(file, participantId) {
    if (!storage) {
        console.error('Firebase Storage not initialized');
        return null;
    }
    
    try {
        // Create unique filename
        const timestamp = Date.now();
        const filename = `photos/${participantId}_${timestamp}_${file.name}`;
        
        // Upload file
        const storageRef = storage.ref();
        const photoRef = storageRef.child(filename);
        const snapshot = await photoRef.put(file);
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log('Photo uploaded:', downloadURL);
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
}

// Load today's submissions
async function loadTodaySubmissions() {
    if (!db) {
        console.error('Firebase not initialized');
        return [];
    }
    
    try {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Query for today's submissions
        const snapshot = await db.collection('submissions')
            .where('created_at', '>=', today.toISOString())
            .orderBy('created_at', 'desc')
            .get();
        
        const submissions = [];
        snapshot.forEach((doc) => {
            submissions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`Loaded ${submissions.length} submissions for today`);
        return submissions;
    } catch (error) {
        console.error('Error loading submissions:', error);
        return [];
    }
}

// Real-time submission listener
function listenToSubmissions(callback) {
    if (!db) {
        console.error('Firebase not initialized');
        return null;
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Listen to changes
    const unsubscribe = db.collection('submissions')
        .where('created_at', '>=', today.toISOString())
        .orderBy('created_at', 'desc')
        .onSnapshot((snapshot) => {
            const submissions = [];
            snapshot.forEach((doc) => {
                submissions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Call callback with updated submissions
            callback(submissions);
        }, (error) => {
            console.error('Error listening to submissions:', error);
        });
    
    return unsubscribe;
}

// Save daily prompt
async function saveDailyPrompt(prompt, date) {
    if (!db) {
        console.error('Firebase not initialized');
        return null;
    }
    
    try {
        const promptData = {
            prompt: prompt,
            date: date || new Date().toISOString().split('T')[0],
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Use date as document ID for easy retrieval
        await db.collection('prompts').doc(promptData.date).set(promptData);
        console.log('Daily prompt saved:', promptData.date);
        
        return promptData.date;
    } catch (error) {
        console.error('Error saving prompt:', error);
        throw error;
    }
}

// Get today's prompt
async function getTodayPrompt() {
    if (!db) {
        console.error('Firebase not initialized');
        return null;
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const doc = await db.collection('prompts').doc(today).get();
        
        if (doc.exists) {
            return doc.data().prompt;
        } else {
            console.log('No prompt found for today');
            return null;
        }
    } catch (error) {
        console.error('Error getting prompt:', error);
        return null;
    }
}

// Get submission statistics
async function getSubmissionStats() {
    if (!db) {
        console.error('Firebase not initialized');
        return null;
    }
    
    try {
        const submissions = await loadTodaySubmissions();
        
        // Calculate statistics
        const stats = {
            total: submissions.length,
            platforms: {},
            keywords: {},
            locations: {},
            timeDistribution: {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0
            }
        };
        
        // Process submissions
        submissions.forEach(submission => {
            // Time distribution
            if (submission.timeOfDay) {
                stats.timeDistribution[submission.timeOfDay]++;
            }
            
            // Keywords frequency
            if (submission.keywords) {
                submission.keywords.forEach(keyword => {
                    stats.keywords[keyword] = (stats.keywords[keyword] || 0) + 1;
                });
            }
            
            // Location distribution
            if (submission.locationName) {
                stats.locations[submission.locationName] = 
                    (stats.locations[submission.locationName] || 0) + 1;
            }
        });
        
        // Sort keywords by frequency
        stats.topKeywords = Object.entries(stats.keywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));
        
        return stats;
    } catch (error) {
        console.error('Error getting stats:', error);
        return null;
    }
}

// Export functions for use in other modules
window.firebaseFunctions = {
    initializeFirebase,
    saveSubmission,
    uploadPhoto,
    loadTodaySubmissions,
    listenToSubmissions,
    saveDailyPrompt,
    getTodayPrompt,
    getSubmissionStats,
    isInitialized: () => db !== null && storage !== null
};

console.log('Firebase.js loaded');