// Daily Ritual - Map Visualization

// Mapbox token (replace with your token)
mapboxgl.accessToken = 'pk.eyJ1IjoiamF5Y2VrIiwiYSI6ImNtaThkY2UzMDBiM3kya3B0cjJtbWxxeDMifQ.LVC8qzfwKQl0DEgAOYOwAg';

let map = null;
let markers = [];
let connections = [];

// Initialize map
function initializeMap() {
    if (map) {
        return; // Already initialized
    }
    
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.0060, 40.7128], // NYC
        zoom: 12,
        pitch: 30
    });
    
    map.on('load', () => {
        console.log('Map loaded');
        setupMapLayers();
        
        // Load submissions
        loadSubmissions();
        
        // Set up real-time updates if Firebase is available
        if (window.firebaseFunctions && window.firebaseFunctions.isInitialized()) {
            setupRealtimeUpdates();
        }
    });
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
}

// Setup map layers
function setupMapLayers() {
    // Add source for submissions
    map.addSource('submissions', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });
    
    // Heat map layer
    map.addLayer({
        id: 'heat',
        type: 'heatmap',
        source: 'submissions',
        paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1,
                9, 3
            ],
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(102, 126, 234, 0)',
                0.2, 'rgba(102, 126, 234, 0.2)',
                0.4, 'rgba(102, 126, 234, 0.4)',
                0.6, 'rgba(147, 51, 234, 0.6)',
                0.8, 'rgba(236, 72, 153, 0.8)',
                1, 'rgba(248, 113, 113, 1)'
            ],
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 2,
                9, 20
            ]
        }
    });
    
    // Circle layer for individual submissions
    map.addLayer({
        id: 'submission-points',
        type: 'circle',
        source: 'submissions',
        paint: {
            'circle-radius': 8,
            'circle-color': '#667eea',
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
        }
    });
    
    // Connection lines source
    map.addSource('connections', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });
    
    // Connection lines layer (initially hidden)
    map.addLayer({
        id: 'connection-lines',
        type: 'line',
        source: 'connections',
        layout: {
            'visibility': 'none'
        },
        paint: {
            'line-color': '#667eea',
            'line-width': 2,
            'line-opacity': 0.3
        }
    });
    
    // Click handler for submissions
    map.on('click', 'submission-points', (e) => {
        const properties = e.features[0].properties;
        showSubmissionPopup(e.lngLat, properties);
    });
    
    // Change cursor on hover
    map.on('mouseenter', 'submission-points', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'submission-points', () => {
        map.getCanvas().style.cursor = '';
    });
}

// Load submissions
async function loadSubmissions() {
    try {
        let submissions = [];
        
        // Check if demo mode
        if (window.appFunctions.isDemo()) {
            // Load demo submissions from localStorage
            submissions = window.uploadFunctions.loadDemoSubmissions();
            
            // Add additional demo data if needed
            if (submissions.length < 10) {
                submissions = submissions.concat(window.demoData.generateDemoSubmissions(20));
            }
        } else if (window.firebaseFunctions && window.firebaseFunctions.isInitialized()) {
            // Load from Firebase
            submissions = await window.firebaseFunctions.loadTodaySubmissions();
        }
        
        // Update global submissions array
        window.submissions = submissions;
        
        // Update map
        updateMapData(submissions);
        
        // Update statistics
        updateMapStatistics(submissions);
        
        // Update keyword cloud
        updateKeywordCloud(submissions);
        
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

// Update map data
function updateMapData(submissions) {
    // Convert submissions to GeoJSON
    const geojson = {
        type: 'FeatureCollection',
        features: submissions.map(submission => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                    submission.location.lng,
                    submission.location.lat
                ]
            },
            properties: {
                id: submission.participantId,
                keywords: submission.keywords.join(', '),
                timeOfDay: submission.timeOfDay,
                locationName: submission.location.name,
                photoUrl: submission.photoUrl
            }
        }))
    };
    
    // Update source
    if (map.getSource('submissions')) {
        map.getSource('submissions').setData(geojson);
    }
    
    // Generate connections
    if (window.connectionsVisible) {
        generateConnections(submissions);
    }
}

// Generate connections between submissions
function generateConnections(submissions) {
    const connectionFeatures = [];
    
    // Find connections based on shared keywords
    for (let i = 0; i < submissions.length; i++) {
        for (let j = i + 1; j < submissions.length; j++) {
            const shared = submissions[i].keywords.filter(k => 
                submissions[j].keywords.includes(k)
            );
            
            if (shared.length > 0) {
                connectionFeatures.push({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [submissions[i].location.lng, submissions[i].location.lat],
                            [submissions[j].location.lng, submissions[j].location.lat]
                        ]
                    },
                    properties: {
                        sharedKeywords: shared.join(', '),
                        strength: shared.length
                    }
                });
            }
        }
    }
    
    // Update connections source
    if (map.getSource('connections')) {
        map.getSource('connections').setData({
            type: 'FeatureCollection',
            features: connectionFeatures
        });
    }
}

// Show connections
function showConnections() {
    if (map) {
        map.setLayoutProperty('connection-lines', 'visibility', 'visible');
        generateConnections(window.submissions || []);
    }
}

// Hide connections
function hideConnections() {
    if (map) {
        map.setLayoutProperty('connection-lines', 'visibility', 'none');
    }
}

// Show submission popup
function showSubmissionPopup(lngLat, properties) {
    const html = `
        <div style="max-width: 200px;">
            ${properties.photoUrl && properties.photoUrl !== 'null' ? 
                `<img src="${properties.photoUrl}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;">` : ''
            }
            <p style="margin: 5px 0;"><strong>${properties.locationName || 'Manhattan'}</strong></p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">${properties.timeOfDay}</p>
            <div class="popup-keywords">
                ${properties.keywords.split(', ').map(k => 
                    `<span class="popup-keyword">${k}</span>`
                ).join('')}
            </div>
        </div>
    `;
    
    new mapboxgl.Popup()
        .setLngLat(lngLat)
        .setHTML(html)
        .addTo(map);
}

// Update map statistics
function updateMapStatistics(submissions) {
    // Update response count
    document.getElementById('response-count').textContent = 
        `${submissions.length} response${submissions.length !== 1 ? 's' : ''}`;
}

// Update keyword cloud
function updateKeywordCloud(submissions) {
    const keywordCounts = {};
    
    // Count keyword frequencies
    submissions.forEach(submission => {
        submission.keywords.forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
    });
    
    // Sort by frequency
    const topKeywords = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    // Update keyword list
    const keywordList = document.getElementById('keyword-list');
    if (keywordList) {
        keywordList.innerHTML = topKeywords.map(([keyword, count]) => 
            `<span class="keyword-tag">${keyword} (${count})</span>`
        ).join('');
    }
}

// Setup real-time updates
function setupRealtimeUpdates() {
    window.firebaseFunctions.listenToSubmissions((submissions) => {
        console.log('Real-time update:', submissions.length, 'submissions');
        
        // Update global array
        window.submissions = submissions;
        
        // Update map
        updateMapData(submissions);
        updateMapStatistics(submissions);
        updateKeywordCloud(submissions);
    });
}

// Fly to location
function flyToLocation(lng, lat) {
    if (map) {
        map.flyTo({
            center: [lng, lat],
            zoom: 14,
            pitch: 45,
            bearing: -17.6,
            essential: true
        });
    }
}

// Export functions
window.mapFunctions = {
    initializeMap,
    loadSubmissions,
    showConnections,
    hideConnections,
    flyToLocation,
    updateMapData
};

// Export map for global access
window.map = map;

console.log('Map.js loaded');