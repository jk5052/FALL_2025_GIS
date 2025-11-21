// Daily Ritual - Main App Controller

// Global state
let currentScreen = 'intro';
let isDemo = false;
let currentPrompt = '';
let submissions = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Daily Ritual App Initialized');
    
    // Initialize modules
    initializeFirebase();
    loadTodayPrompt();
    initializeEventListeners();
    updateDateTime();
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
});

// Screen Management
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    document.getElementById(`${screenName}-screen`).classList.add('active');
    currentScreen = screenName;
    
    // Screen-specific initialization
    switch(screenName) {
        case 'intro':
            loadTodayPrompt();
            break;
        case 'upload':
            document.getElementById('prompt-reminder-text').textContent = currentPrompt;
            resetUploadForm();
            break;
        case 'map':
            initializeMap();
            loadSubmissions();
            break;
        case 'success':
            setTimeout(() => {
                showScreen('map');
            }, 3000);
            break;
    }
}

// Event Listeners
function initializeEventListeners() {
    // Navigation
    document.getElementById('participate-btn').addEventListener('click', () => {
        showScreen('upload');
    });
    
    document.getElementById('view-map-btn').addEventListener('click', () => {
        showScreen('map');
    });
    
    document.getElementById('demo-btn').addEventListener('click', () => {
        enableDemoMode();
    });
    
    document.getElementById('back-to-intro').addEventListener('click', () => {
        showScreen('intro');
    });
    
    document.getElementById('back-from-map').addEventListener('click', () => {
        showScreen('intro');
    });
    
    document.getElementById('view-final-map').addEventListener('click', () => {
        showScreen('map');
    });
    
    document.getElementById('new-response').addEventListener('click', () => {
        showScreen('upload');
    });
    
    // Upload functionality
    document.getElementById('photo-input').addEventListener('change', handlePhotoUpload);
    document.getElementById('submit-btn').addEventListener('click', handleSubmission);
    
    // Keywords validation
    document.querySelectorAll('.keyword-input').forEach(input => {
        input.addEventListener('input', validateForm);
    });
    
    document.getElementById('location-select').addEventListener('change', validateForm);
    
    // Map controls
    document.getElementById('toggle-connections').addEventListener('click', toggleConnections);
    document.getElementById('toggle-heat').addEventListener('click', toggleHeatmap);
}

// Form Validation
function validateForm() {
    const hasPhoto = document.querySelector('#photo-preview img') !== null;
    const keywords = Array.from(document.querySelectorAll('.keyword-input'))
        .map(input => input.value.trim())
        .filter(val => val.length > 0);
    const hasLocation = document.getElementById('location-select').value !== '';
    
    const isValid = hasPhoto && keywords.length >= 3 && hasLocation;
    document.getElementById('submit-btn').disabled = !isValid;
}

// Reset Upload Form
function resetUploadForm() {
    document.getElementById('photo-input').value = '';
    document.getElementById('photo-preview').innerHTML = `
        <span class="upload-icon">📷</span>
        <span class="upload-text">Add your photo</span>
    `;
    document.getElementById('photo-preview').classList.remove('has-image');
    
    document.querySelectorAll('.keyword-input').forEach(input => {
        input.value = '';
    });
    
    document.getElementById('location-select').value = '';
    document.getElementById('submit-btn').disabled = true;
}

// Date/Time Updates
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Update prompt date
    const promptDate = document.getElementById('prompt-date');
    if (promptDate) {
        promptDate.textContent = dateStr;
    }
    
    // Update map time
    const currentTime = document.getElementById('current-time');
    if (currentTime) {
        currentTime.textContent = timeStr;
    }
}

// Demo Mode
function enableDemoMode() {
    isDemo = true;
    console.log('Demo mode enabled');
    
    // Add demo indicator
    if (!document.querySelector('.demo-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'demo-indicator';
        indicator.textContent = 'DEMO MODE';
        document.body.appendChild(indicator);
    }
    
    // Load demo data
    loadDemoData();
    
    // Show map with demo data
    showScreen('map');
}

// Handle Submission Success
function handleSubmissionSuccess() {
    showScreen('success');
    
    // Reload submissions on map
    if (currentScreen === 'map') {
        loadSubmissions();
    }
}

// Connection Management for Map
let connectionsVisible = false;
function toggleConnections() {
    connectionsVisible = !connectionsVisible;
    const btn = document.getElementById('toggle-connections');
    
    if (connectionsVisible) {
        btn.textContent = 'Hide Connections';
        btn.classList.add('active');
        showConnections();
    } else {
        btn.textContent = 'Show Connections';
        btn.classList.remove('active');
        hideConnections();
    }
}

// Heatmap Toggle
let heatmapVisible = true;
function toggleHeatmap() {
    heatmapVisible = !heatmapVisible;
    const btn = document.getElementById('toggle-heat');
    
    if (heatmapVisible) {
        btn.classList.add('active');
        if (window.map) {
            map.setLayoutProperty('heat', 'visibility', 'visible');
        }
    } else {
        btn.classList.remove('active');
        if (window.map) {
            map.setLayoutProperty('heat', 'visibility', 'none');
        }
    }
}

// Utility Functions
function generateParticipantId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `participant_${timestamp}_${random}`;
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

// Error Handling
window.addEventListener('error', (e) => {
    console.error('App error:', e);
    
    // Show user-friendly error message
    if (!isDemo) {
        // Could show a toast notification here
        console.error('An error occurred. Please try again.');
    }
});

// Export functions for use in other modules
window.appFunctions = {
    showScreen,
    handleSubmissionSuccess,
    generateParticipantId,
    getTimeOfDay,
    isDemo: () => isDemo,
    getCurrentPrompt: () => currentPrompt,
    setCurrentPrompt: (prompt) => { currentPrompt = prompt; }
};

console.log('App.js loaded');