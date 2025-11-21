// Daily Ritual - Timeline Controls

let currentHour = 12;
let isPlaying = false;
let playInterval = null;

// Initialize timeline controls
function initTimeline() {
    const slider = document.getElementById('time-slider');
    const display = document.getElementById('time-display');

    slider.addEventListener('input', (e) => {
        currentHour = parseInt(e.target.value);
        updateTimeDisplay(currentHour);
        filterByTime(currentHour);
    });
}

// Update time display
function updateTimeDisplay(hour) {
    const display = document.getElementById('time-display');
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    display.textContent = timeString;
}

// Filter posts by time
function filterByTime(hour) {
    if (!map.getSource('social-posts')) return;

    // Show only posts from this hour
    map.setFilter('posts', [
        'all',
        ['==', ['get', 'hour'], hour],
        currentPlatform === 'all' ? true : ['==', ['get', 'platform'], currentPlatform]
    ]);

    map.setFilter('heat', [
        'all',
        ['==', ['get', 'hour'], hour],
        currentPlatform === 'all' ? true : ['==', ['get', 'platform'], currentPlatform]
    ]);

    // Update stats for this hour
    updateHourlyStats(hour);
}

// Update statistics for specific hour
function updateHourlyStats(hour) {
    if (!currentDate || !currentData[currentDate]) return;

    const hourlyData = currentData[currentDate].responses.filter(r => {
        const responseHour = new Date(r.timestamp).getHours();
        return responseHour === hour && 
               (currentPlatform === 'all' || r.platform === currentPlatform);
    });

    // Update UI with hourly stats
    const peakElement = document.getElementById('peak-hour');
    if (hourlyData.length > 0) {
        peakElement.textContent = `${hourlyData.length} posts at ${hour}:00`;
    }
}

// Play animation through 24 hours
function playTimeline() {
    if (isPlaying) {
        stopTimeline();
        return;
    }

    isPlaying = true;
    playInterval = setInterval(() => {
        currentHour = (currentHour + 1) % 24;
        
        // Update slider
        document.getElementById('time-slider').value = currentHour;
        updateTimeDisplay(currentHour);
        filterByTime(currentHour);

        // Stop at end of day
        if (currentHour === 23) {
            stopTimeline();
        }
    }, 1000); // 1 second per hour
}

// Stop timeline animation
function stopTimeline() {
    isPlaying = false;
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
}

// Get time category from hour
function getTimeCategory(hour) {
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
}

// Analyze temporal patterns
function analyzeTemporalPatterns(responses) {
    const hourlyCount = new Array(24).fill(0);
    const hourlyEmotions = {};

    responses.forEach(response => {
        const hour = new Date(response.timestamp).getHours();
        hourlyCount[hour]++;

        if (!hourlyEmotions[hour]) {
            hourlyEmotions[hour] = {};
        }

        // Count emotions per hour
        response.keywords.forEach(keyword => {
            hourlyEmotions[hour][keyword] = (hourlyEmotions[hour][keyword] || 0) + 1;
        });
    });

    // Find peak hour
    const peakHour = hourlyCount.indexOf(Math.max(...hourlyCount));
    
    // Find emotional shifts
    const emotionalJourney = Object.keys(hourlyEmotions).map(hour => ({
        hour: parseInt(hour),
        dominantEmotion: getDominantEmotion(hourlyEmotions[hour])
    }));

    return {
        peakHour,
        hourlyCount,
        emotionalJourney
    };
}

// Get dominant emotion from frequency map
function getDominantEmotion(emotionMap) {
    if (!emotionMap || Object.keys(emotionMap).length === 0) return 'neutral';
    
    return Object.entries(emotionMap)
        .sort((a, b) => b[1] - a[1])
        [0]?.[0] || 'neutral';
}

// Create hourly visualization
function createHourlyVisualization(data) {
    const patterns = analyzeTemporalPatterns(data);
    
    // Update peak hour display
    document.getElementById('peak-hour').textContent = 
        `${patterns.peakHour}:00 (${patterns.hourlyCount[patterns.peakHour]} posts)`;

    // Create mini chart (could be expanded with D3.js)
    const maxCount = Math.max(...patterns.hourlyCount);
    const chartHTML = patterns.hourlyCount.map((count, hour) => {
        const height = (count / maxCount) * 100;
        return `<div class="hour-bar" style="height: ${height}%" title="${hour}:00 - ${count} posts"></div>`;
    }).join('');

    // Add chart to UI if container exists
    const chartContainer = document.getElementById('hourly-chart');
    if (chartContainer) {
        chartContainer.innerHTML = chartHTML;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initTimeline();
});