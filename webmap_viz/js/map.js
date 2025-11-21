// Daily Ritual - Main Map Visualization with Genmoji Sticker Markers

// Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiamF5Y2VrIiwiYSI6ImNtaThkY2UzMDBiM3kya3B0cjJtbWxxeDMifQ.LVC8qzfwKQl0DEgAOYOwAg';

// Global variables
let map;
let currentData = [];
let currentDate = null;
let currentPlatform = 'all';
let genmojiMarkers = []; // Store all genmoji markers

// Initialize map
function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-74.0060, 40.7128], // NYC
        zoom: 11,
        pitch: 45,
        bearing: -17.6
    });

    map.on('load', () => {
        console.log('Map loaded');
        loadData();
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
}

// Clear all genmoji markers
function clearGenmojiMarkers() {
    genmojiMarkers.forEach(marker => marker.remove());
    genmojiMarkers = [];
}

// Add genmoji markers to map (with real-time generation)
async function addGenmojiMarkers(posts) {
    console.log('🎨 Adding genmoji markers to map...');

    clearGenmojiMarkers();

    // Show loading indicator
    showLoadingIndicator(posts.length);

    let loaded = 0;

    for (const post of posts) {
        // Skip if no location
        if (!post.lat || !post.lng) continue;

        // Generate genmoji in real-time using Firebase Function
        let genmojiUrl = post.genmoji || 'images/default-genmoji.svg';

        if (!post.genmoji && window.generateGenmojiFromPost) {
            try {
                genmojiUrl = await window.generateGenmojiFromPost(post);
            } catch (error) {
                console.error('Failed to generate genmoji:', error);
                genmojiUrl = post.imageThumbnail || 'images/default-genmoji.svg';
            }
        }

        // Create marker element
        const el = document.createElement('div');
        el.className = 'genmoji-marker';

        el.innerHTML = `
            <div class="genmoji-wrapper">
                <img src="${genmojiUrl}" alt="genmoji" onerror="this.src='images/default-genmoji.svg'" />
                <div class="genmoji-glow"></div>
            </div>
        `;

        // Add click event
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            showPostModal(post, genmojiUrl);
        });

        // Add hover events
        el.addEventListener('mouseenter', () => {
            el.classList.add('hover');
            showQuickPreview(post, el);
        });

        el.addEventListener('mouseleave', () => {
            el.classList.remove('hover');
            hideQuickPreview();
        });

        // Create and add marker
        const marker = new mapboxgl.Marker(el)
            .setLngLat([post.lng, post.lat])
            .addTo(map);

        genmojiMarkers.push(marker);

        // Update loading indicator
        loaded++;
        updateLoadingIndicator(loaded, posts.length);
    }

    hideLoadingIndicator();
    console.log(`✅ Added ${genmojiMarkers.length} genmoji markers`);
}

// Loading indicator functions
function showLoadingIndicator(total) {
    const indicator = document.createElement('div');
    indicator.id = 'genmoji-loading';
    indicator.className = 'genmoji-loading';
    indicator.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">Generating genmojis...</div>
            <div class="loading-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="progress-text"><span id="progress-current">0</span> / ${total}</div>
            </div>
        </div>
    `;
    document.body.appendChild(indicator);
}

function updateLoadingIndicator(current, total) {
    const progressFill = document.getElementById('progress-fill');
    const progressCurrent = document.getElementById('progress-current');

    if (progressFill && progressCurrent) {
        const percent = (current / total) * 100;
        progressFill.style.width = `${percent}%`;
        progressCurrent.textContent = current;
    }
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('genmoji-loading');
    if (indicator) {
        indicator.remove();
    }
}

// Show quick preview on hover
function showQuickPreview(post, element) {
    const preview = document.createElement('div');
    preview.className = 'quick-preview';
    preview.id = 'quick-preview';

    const rect = element.getBoundingClientRect();

    preview.innerHTML = `
        <div class="preview-content">
            ${post.imageUrl ? `<img src="${post.imageUrl}" class="preview-image" />` : ''}
            <div class="preview-text">${post.text ? post.text.substring(0, 100) + '...' : 'No caption'}</div>
            <div class="preview-meta">
                <span class="preview-platform">${post.platform}</span>
                <span class="preview-engagement">💜 ${post.engagement || 0}</span>
            </div>
        </div>
    `;

    preview.style.left = `${rect.left + rect.width / 2}px`;
    preview.style.top = `${rect.top - 10}px`;

    document.body.appendChild(preview);
}

// Hide quick preview
function hideQuickPreview() {
    const preview = document.getElementById('quick-preview');
    if (preview) {
        preview.remove();
    }
}

// Show post modal
function showPostModal(post, genmojiUrl) {
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-header">
                <img src="${genmojiUrl}" class="modal-genmoji" onerror="this.src='images/default-genmoji.svg'" />
                <div class="modal-info">
                    <h3>${post.location || 'Manhattan, NYC'}</h3>
                    <p>${post.platform} • ${new Date(post.timestamp).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="modal-body">
                ${post.imageUrl ? `<img src="${post.imageUrl}" class="modal-photo" />` : ''}
                ${post.hashtags && post.hashtags.length > 0 ? `
                    <div class="keywords">
                        ${post.hashtags.map(tag => `<span class="keyword-tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
                ${post.text ? `<p class="original-text">${post.text}</p>` : ''}
            </div>
            <div class="modal-footer">
                <span class="engagement">💜 ${post.engagement || 0}</span>
                <span class="timestamp">${new Date(post.timestamp).toLocaleString()}</span>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close button
    modal.querySelector('.close').onclick = () => {
        modal.remove();
    };

    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// Old blur layer setup and event handlers - REMOVED (now using genmoji markers)

// Image modal function (kept for compatibility)
function showImageModal(properties) {
    const modalHtml = `
        <div id="image-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        " onclick="this.remove()">
            <div style="
                max-width: 80%;
                max-height: 80%;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            " onclick="event.stopPropagation()">
                <img src="${properties.imageUrl}" style="
                    width: 100%;
                    height: auto;
                    display: block;
                ">
                <div style="padding: 20px;">
                    <div style="color: #666; font-size: 12px; margin-bottom: 8px;">
                        ${properties.platform} • ${properties.timestamp ? new Date(properties.timestamp).toLocaleString() : 'Unknown date'}
                    </div>
                    <div style="font-size: 14px; color: #333;">
                        ${properties.text || ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Load data and display genmoji markers
async function loadData() {
    try {
        // Try to load targeted ritual data with genmojis
        const response = await fetch('json/targeted-ritual-data.json');
        const data = await response.json();
        currentData = data;
        console.log('Data loaded:', data);

        // Display first event by default
        const firstDate = Object.keys(data)[0];
        if (firstDate) {
            displayEvent(firstDate);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Use demo data if file not found
        currentData = generateDemoData();
        displayEvent(Object.keys(currentData)[0]);
    }
}

// Display event data on map
function displayEvent(date) {
    const eventData = currentData[date];
    if (!eventData) return;

    console.log(`Displaying event: ${eventData.event} (${date})`);

    // Update UI
    document.getElementById('current-event').textContent = eventData.event;
    document.getElementById('current-prompt').textContent = eventData.prompt;
    document.getElementById('response-count').textContent = eventData.responses.length;

    // Add genmoji markers
    addGenmojiMarkers(eventData.responses);

    currentDate = date;
}

// Generate demo data for testing
function generateDemoData() {
    const events = {
        '2024-04-05': {
            event: 'Earthquake',
            prompt: 'Find where stillness lives after everything moves',
            responses: generateResponses('2024-04-05', 150)
        },
        '2024-11-05': {
            event: 'Election Day',
            prompt: 'What accumulates in the space between choices?',
            responses: generateResponses('2024-11-05', 200)
        },
        '2024-12-09': {
            event: 'First Snow',
            prompt: 'Show me what remains warm',
            responses: generateResponses('2024-12-09', 100)
        }
    };
    return events;
}

// Generate random responses for demo
function generateResponses(date, count) {
    const responses = [];
    const platforms = ['instagram', 'tiktok', 'twitter', 'facebook'];
    const emotions = ['anxious', 'hopeful', 'excited', 'peaceful', 'overwhelmed'];
    
    for (let i = 0; i < count; i++) {
        responses.push({
            id: `${date}_${i}`,
            platform: platforms[Math.floor(Math.random() * platforms.length)],
            timestamp: new Date(`${date}T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00:00`),
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            keywords: emotions.sort(() => 0.5 - Math.random()).slice(0, 3),
            engagement: Math.floor(Math.random() * 1000),
            timeOfDay: ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)]
        });
    }
    return responses;
}

// Update map with selected date
function updateMap(date) {
    currentDate = date;
    const eventData = currentData[date];

    if (!eventData) {
        console.error('No data for date:', date);
        return;
    }

    // Update info panel
    document.getElementById('event-title').textContent = eventData.event;
    document.getElementById('prompt-text').textContent = `"${eventData.prompt}"`;

    // 사진이 있는 데이터만 필터링
    const photoPosts = eventData.responses.filter(r => r.imageUrl);
    document.getElementById('response-count').textContent = photoPosts.length;

    // Convert to GeoJSON
    const geojson = {
        type: 'FeatureCollection',
        features: photoPosts
            .filter(r => currentPlatform === 'all' || r.platform === currentPlatform)
            .map(response => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [response.lng || response.location?.lng || -74.0060, response.lat || response.location?.lat || 40.7128]
                },
                properties: {
                    ...response,
                    keywords: response.keywords ? (Array.isArray(response.keywords) ? response.keywords.join(', ') : response.keywords) : '',
                    imageUrl: response.imageUrl,
                    imageThumbnail: response.imageThumbnail || response.imageUrl,
                    timeOfDay: response.timeOfDay || 'unknown',
                    hour: response.timestamp ? new Date(response.timestamp).getHours() : 0
                }
            }))
    };

    // Update map source
    map.getSource('social-posts').setData(geojson);

    // Update analysis
    updateAnalysis(photoPosts);
}

// Filter by platform
function filterByPlatform(platform) {
    currentPlatform = platform;
    if (currentDate) {
        updateMap(currentDate);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initMap();

    // Date selector
    document.getElementById('date-selector').addEventListener('change', (e) => {
        updateMap(e.target.value);
    });

    // Platform filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterByPlatform(e.target.dataset.platform);
        });
    });
});