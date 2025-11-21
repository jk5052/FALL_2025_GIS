// Daily Ritual - Main Map Visualization with Blur Effects & Photo Thumbnails

// Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiamF5Y2VrIiwiYSI6ImNtaThkY2UzMDBiM3kya3B0cjJtbWxxeDMifQ.LVC8qzfwKQl0DEgAOYOwAg';

// Global variables
let map;
let currentData = [];
let currentDate = null;
let currentPlatform = 'all';
let hoveredStateId = null;

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
        setupLayers();
        loadData();
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
}

// Setup map layers with blur effects
function setupLayers() {
    // Add empty source for social data
    map.addSource('social-posts', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });

    // 1. 블러 효과를 위한 큰 원 (배경 - 가장 큰 블러)
    map.addLayer({
        id: 'posts-blur',
        type: 'circle',
        source: 'social-posts',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 20,
                15, 40
            ],
            'circle-color': [
                'match',
                ['get', 'platform'],
                'instagram', '#E1306C',
                'tiktok', '#FF0050',
                'twitter', '#1DA1F2',
                'facebook', '#4267B2',
                '#888888'
            ],
            'circle-opacity': 0.1,
            'circle-blur': 1
        }
    });

    // 2. 중간 블러 레이어 (글로우 효과)
    map.addLayer({
        id: 'posts-glow',
        type: 'circle',
        source: 'social-posts',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 12,
                15, 25
            ],
            'circle-color': [
                'match',
                ['get', 'platform'],
                'instagram', '#E1306C',
                'tiktok', '#FF0050',
                'twitter', '#1DA1F2',
                'facebook', '#4267B2',
                '#888888'
            ],
            'circle-opacity': 0.2,
            'circle-blur': 0.8
        }
    });

    // 3. 핵심 포인트 (작은 원 - 핀포인트처럼)
    map.addLayer({
        id: 'posts-core',
        type: 'circle',
        source: 'social-posts',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 3,
                15, 8
            ],
            'circle-color': '#ffffff',
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': [
                'match',
                ['get', 'platform'],
                'instagram', '#E1306C',
                'tiktok', '#FF0050',
                'twitter', '#1DA1F2',
                'facebook', '#4267B2',
                '#888888'
            ],
            'circle-stroke-opacity': 0.8
        }
    });

    // 4. 클러스터 레이어
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'social-posts',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                10,
                '#f1f075',
                30,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                25,
                10,
                35,
                30,
                45
            ],
            'circle-blur': 0.6,
            'circle-opacity': 0.7
        }
    });

    // 5. 클러스터 숫자
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'social-posts',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14
        },
        paint: {
            'text-color': '#ffffff'
        }
    });

    // 호버 시 사진 썸네일 표시
    let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
    });

    // 마우스 호버 이벤트
    map.on('mouseenter', 'posts-core', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const properties = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // 사진 썸네일 포함한 팝업
        const html = `
            <div style="width: 200px;">
                ${properties.imageUrl ? `
                    <img src="${properties.imageUrl}"
                         style="width: 100%;
                                height: 150px;
                                object-fit: cover;
                                border-radius: 8px;
                                margin-bottom: 8px;">
                ` : ''}
                <div style="padding: 8px;">
                    <div style="font-size: 10px;
                                color: #888;
                                text-transform: uppercase;
                                margin-bottom: 4px;">
                        ${properties.platform} • ${properties.timeOfDay || 'unknown'}
                    </div>
                    <div style="font-size: 12px; margin-bottom: 8px;">
                        ${properties.locationName || 'Manhattan'}
                    </div>
                    ${properties.keywords ? `
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                            ${properties.keywords.split(',').map(k =>
                                `<span style="background: rgba(99,102,241,0.1);
                                             padding: 2px 6px;
                                             border-radius: 4px;
                                             font-size: 10px;
                                             color: #6366f1;">
                                    ${k.trim()}
                                </span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        popup.setLngLat(coordinates)
            .setHTML(html)
            .addTo(map);
    });

    map.on('mouseleave', 'posts-core', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    // 클릭 시 큰 이미지 모달
    map.on('click', 'posts-core', (e) => {
        const properties = e.features[0].properties;

        if (properties.imageUrl) {
            showImageModal(properties);
        }
    });
}

// 이미지 모달 함수
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

// Load data
async function loadData() {
    try {
        // In production, this would fetch from your processed data
        const response = await fetch('data/processed/sample-data.json');
        const data = await response.json();
        currentData = data;
        console.log('Data loaded:', data);
    } catch (error) {
        console.error('Error loading data:', error);
        // Use demo data if file not found
        currentData = generateDemoData();
    }
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