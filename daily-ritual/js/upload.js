// Daily Ritual - Upload Management

let selectedFile = null;
let uploadedPhotoUrl = null;

// Handle photo selection
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
    }
    
    selectedFile = file;
    
    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('photo-preview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        preview.classList.add('has-image');
        
        // Trigger form validation
        validateForm();
    };
    reader.readAsDataURL(file);
}

// Handle form submission
async function handleSubmission() {
    // Check if demo mode
    if (window.appFunctions.isDemo()) {
        handleDemoSubmission();
        return;
    }
    
    // Get form data
    const keywords = Array.from(document.querySelectorAll('.keyword-input'))
        .map(input => input.value.trim())
        .filter(val => val.length > 0);
    
    const locationSelect = document.getElementById('location-select');
    const locationCoords = locationSelect.value.split(',');
    const locationName = locationSelect.options[locationSelect.selectedIndex].text;
    
    // Disable submit button
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
    
    try {
        // Generate participant ID
        const participantId = window.appFunctions.generateParticipantId();
        
        // Upload photo if not demo
        let photoUrl = uploadedPhotoUrl;
        if (!photoUrl && selectedFile && window.firebaseFunctions.isInitialized()) {
            photoUrl = await window.firebaseFunctions.uploadPhoto(selectedFile, participantId);
        }
        
        // Prepare submission data
        const submissionData = {
            participantId: participantId,
            prompt: window.appFunctions.getCurrentPrompt(),
            keywords: keywords,
            photoUrl: photoUrl || 'https://picsum.photos/400/400?random=' + Date.now(),
            location: {
                lat: parseFloat(locationCoords[0]) + (Math.random() - 0.5) * 0.002, // Fuzzy location
                lng: parseFloat(locationCoords[1]) + (Math.random() - 0.5) * 0.002,
                name: locationName
            },
            timeOfDay: window.appFunctions.getTimeOfDay(),
            date: new Date().toISOString().split('T')[0],
            platform: 'daily-ritual-app'
        };
        
        // Save to Firebase
        if (window.firebaseFunctions.isInitialized()) {
            await window.firebaseFunctions.saveSubmission(submissionData);
        } else {
            // Store locally for demo
            storeDemoSubmission(submissionData);
        }
        
        // Success!
        console.log('Submission successful:', submissionData);
        window.appFunctions.handleSubmissionSuccess();
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('There was an error submitting your response. Please try again.');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Response';
    }
}

// Handle demo submission
function handleDemoSubmission() {
    // Get form data
    const keywords = Array.from(document.querySelectorAll('.keyword-input'))
        .map(input => input.value.trim())
        .filter(val => val.length > 0);
    
    const locationSelect = document.getElementById('location-select');
    const locationCoords = locationSelect.value.split(',');
    const locationName = locationSelect.options[locationSelect.selectedIndex].text;
    
    // Create demo submission
    const submissionData = {
        participantId: window.appFunctions.generateParticipantId(),
        prompt: window.appFunctions.getCurrentPrompt(),
        keywords: keywords,
        photoUrl: 'https://picsum.photos/400/400?random=' + Date.now(),
        location: {
            lat: parseFloat(locationCoords[0]) + (Math.random() - 0.5) * 0.002,
            lng: parseFloat(locationCoords[1]) + (Math.random() - 0.5) * 0.002,
            name: locationName
        },
        timeOfDay: window.appFunctions.getTimeOfDay(),
        date: new Date().toISOString().split('T')[0],
        platform: 'demo',
        timestamp: new Date().toISOString()
    };
    
    // Store in demo submissions
    storeDemoSubmission(submissionData);
    
    // Show success
    window.appFunctions.handleSubmissionSuccess();
}

// Store demo submission locally
function storeDemoSubmission(submissionData) {
    // Get existing demo submissions from localStorage
    let demoSubmissions = JSON.parse(localStorage.getItem('demoSubmissions') || '[]');
    
    // Add new submission
    demoSubmissions.push(submissionData);
    
    // Keep only last 50 submissions
    if (demoSubmissions.length > 50) {
        demoSubmissions = demoSubmissions.slice(-50);
    }
    
    // Save back to localStorage
    localStorage.setItem('demoSubmissions', JSON.stringify(demoSubmissions));
    
    // Update global submissions array
    if (window.submissions) {
        window.submissions.push(submissionData);
    }
    
    console.log('Demo submission stored:', submissionData);
}

// Load demo submissions
function loadDemoSubmissions() {
    const demoSubmissions = JSON.parse(localStorage.getItem('demoSubmissions') || '[]');
    return demoSubmissions;
}

// Clear demo submissions
function clearDemoSubmissions() {
    localStorage.removeItem('demoSubmissions');
    console.log('Demo submissions cleared');
}

// Validate individual keyword input
function validateKeywordInput(input) {
    const value = input.value.trim();
    
    // Remove special characters
    const cleaned = value.replace(/[^a-zA-Z0-9\s]/g, '');
    if (cleaned !== value) {
        input.value = cleaned;
    }
    
    // Limit length
    if (input.value.length > 20) {
        input.value = input.value.substring(0, 20);
    }
}

// Auto-resize photo for upload
async function resizeImage(file, maxWidth = 1200, maxHeight = 1200) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(function(blob) {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', 0.9);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Export functions
window.uploadFunctions = {
    handlePhotoUpload,
    handleSubmission,
    loadDemoSubmissions,
    clearDemoSubmissions,
    resizeImage
};

console.log('Upload.js loaded');