// Daily Ritual - Layer Management

// Platform colors and styles
const platformStyles = {
    instagram: {
        color: '#E1306C',
        icon: '📸',
        name: 'Instagram'
    },
    tiktok: {
        color: '#000000',
        borderColor: '#FF0050',
        icon: '🎵',
        name: 'TikTok'
    },
    twitter: {
        color: '#1DA1F2',
        icon: '🐦',
        name: 'Twitter/X'
    },
    facebook: {
        color: '#4267B2',
        icon: '👥',
        name: 'Facebook'
    }
};

// Layer visibility states
let layerVisibility = {
    heat: true,
    posts: true,
    connections: false,
    clusters: false
};

// Add platform-specific layers
function addPlatformLayers() {
    // Create separate source for each platform
    Object.keys(platformStyles).forEach(platform => {
        map.addSource(`${platform}-posts`, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
        });

        // Clustered layer
        map.addLayer({
            id: `${platform}-clusters`,
            type: 'circle',
            source: `${platform}-posts`,
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': platformStyles[platform].color,
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20, 100,
                    30, 750,
                    40
                ],
                'circle-opacity': 0.6
            }
        });

        // Cluster count layer
        map.addLayer({
            id: `${platform}-cluster-count`,
            type: 'symbol',
            source: `${platform}-posts`,
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            },
            paint: {
                'text-color': '#ffffff'
            }
        });

        // Individual points
        map.addLayer({
            id: `${platform}-points`,
            type: 'circle',
            source: `${platform}-posts`,
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': platformStyles[platform].color,
                'circle-radius': 6,
                'circle-stroke-width': 2,
                'circle-stroke-color': platformStyles[platform].borderColor || '#ffffff',
                'circle-stroke-opacity': 0.5
            }
        });
    });
}

// Add connection layer between related posts
function addConnectionLayer() {
    map.addSource('connections', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addLayer({
        id: 'connections',
        type: 'line',
        source: 'connections',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': [
                'match',
                ['get', 'connectionType'],
                'temporal', '#6366f1',  // Same time
                'keyword', '#f59e0b',   // Same keywords
                'spatial', '#10b981',   // Same location
                '#888888'
            ],
            'line-width': 2,
            'line-opacity': 0.3
        }
    });
}

// Add 3D extrusion layer for density
function add3DLayer() {
    // Create hexagon grid source
    map.addSource('hexgrid', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addLayer({
        id: 'hexgrid-3d',
        type: 'fill-extrusion',
        source: 'hexgrid',
        paint: {
            'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'count'],
                0, '#3b82f6',
                10, '#6366f1',
                50, '#8b5cf6',
                100, '#d946ef'
            ],
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['get', 'count'],
                0, 0,
                100, 400
            ],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.8
        }
    });
}

// Toggle layer visibility
function toggleLayer(layerName) {
    layerVisibility[layerName] = !layerVisibility[layerName];
    
    const visibility = layerVisibility[layerName] ? 'visible' : 'none';
    
    switch(layerName) {
        case 'heat':
            map.setLayoutProperty('heat', 'visibility', visibility);
            break;
        case 'posts':
            map.setLayoutProperty('posts', 'visibility', visibility);
            break;
        case 'connections':
            map.setLayoutProperty('connections', 'visibility', visibility);
            break;
        case '3d':
            map.setLayoutProperty('hexgrid-3d', 'visibility', visibility);
            break;
    }
}

// Update platform-specific data
function updatePlatformData(platform, data) {
    const geojson = {
        type: 'FeatureCollection',
        features: data.map(item => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [item.lng, item.lat]
            },
            properties: {
                ...item,
                platform: platform
            }
        }))
    };

    if (map.getSource(`${platform}-posts`)) {
        map.getSource(`${platform}-posts`).setData(geojson);
    }
}

// Generate connections between posts
function generateConnections(posts) {
    const connections = [];
    
    // Find posts with shared keywords
    posts.forEach((post1, i) => {
        posts.slice(i + 1).forEach(post2 => {
            // Check for shared keywords
            const sharedKeywords = post1.keywords.filter(k => 
                post2.keywords.includes(k)
            );
            
            if (sharedKeywords.length > 0) {
                connections.push({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [post1.lng, post1.lat],
                            [post2.lng, post2.lat]
                        ]
                    },
                    properties: {
                        connectionType: 'keyword',
                        strength: sharedKeywords.length
                    }
                });
            }
            
            // Check for temporal proximity (same hour)
            const time1 = new Date(post1.timestamp).getHours();
            const time2 = new Date(post2.timestamp).getHours();
            if (Math.abs(time1 - time2) <= 1) {
                connections.push({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [post1.lng, post1.lat],
                            [post2.lng, post2.lat]
                        ]
                    },
                    properties: {
                        connectionType: 'temporal',
                        strength: 1
                    }
                });
            }
        });
    });
    
    return {
        type: 'FeatureCollection',
        features: connections
    };
}

// Create hexagon grid for density visualization
function createHexGrid(posts, cellSize = 0.5) {
    // Simple hexagon grid generation
    const hexagons = {};
    
    posts.forEach(post => {
        // Calculate hex cell
        const hexKey = `${Math.floor(post.lat / cellSize)},${Math.floor(post.lng / cellSize)}`;
        
        if (!hexagons[hexKey]) {
            hexagons[hexKey] = {
                lat: Math.floor(post.lat / cellSize) * cellSize + cellSize / 2,
                lng: Math.floor(post.lng / cellSize) * cellSize + cellSize / 2,
                count: 0,
                platforms: {}
            };
        }
        
        hexagons[hexKey].count++;
        hexagons[hexKey].platforms[post.platform] = 
            (hexagons[hexKey].platforms[post.platform] || 0) + 1;
    });
    
    // Convert to GeoJSON
    const features = Object.values(hexagons).map(hex => ({
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [createHexagonCoords(hex.lng, hex.lat, cellSize / 2)]
        },
        properties: {
            count: hex.count,
            dominantPlatform: Object.entries(hex.platforms)
                .sort((a, b) => b[1] - a[1])[0]?.[0]
        }
    }));
    
    return {
        type: 'FeatureCollection',
        features
    };
}

// Create hexagon coordinates
function createHexagonCoords(lng, lat, radius) {
    const coords = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        coords.push([
            lng + radius * Math.cos(angle) * 0.01,
            lat + radius * Math.sin(angle) * 0.01
        ]);
    }
    coords.push(coords[0]); // Close polygon
    return coords;
}

// Initialize layers when map loads
function initializeLayers() {
    addPlatformLayers();
    addConnectionLayer();
    add3DLayer();
}

// Export functions for use in other modules
window.layerFunctions = {
    toggleLayer,
    updatePlatformData,
    generateConnections,
    createHexGrid,
    initializeLayers
};