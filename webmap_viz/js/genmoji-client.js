// Genmoji Client - Call Firebase Function to generate genmojis

// Firebase Function URL
const GENMOJI_FUNCTION_URL = 'https://us-central1-daily-ritual-nyc.cloudfunctions.net/generateGenmoji';

// Cache for generated genmojis
const genmojiCache = new Map();

/**
 * Generate genmoji using Firebase Function
 * @param {Object} post - Post data with keywords, platform, etc.
 * @returns {Promise<string>} - URL of generated genmoji image
 */
async function generateGenmojiFromPost(post) {
    try {
        // Extract data from post
        const keywords = extractKeywords(post);
        const platform = post.platform || 'instagram';
        const timeOfDay = getTimeOfDay(post.timestamp);
        const emotion = extractEmotion(post);
        
        // Create cache key
        const cacheKey = `${keywords.join('-')}-${platform}-${timeOfDay}-${emotion}`;
        
        // Check cache
        if (genmojiCache.has(cacheKey)) {
            console.log('Using cached genmoji');
            return genmojiCache.get(cacheKey);
        }
        
        console.log('Generating genmoji:', { keywords, platform, timeOfDay, emotion });
        
        // Call Firebase Function
        const response = await fetch(GENMOJI_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                keywords,
                platform,
                timeOfDay,
                emotion
            })
        });
        
        if (!response.ok) {
            throw new Error(`Function error: ${response.status}`);
        }
        
        // Get image blob
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Cache the result
        genmojiCache.set(cacheKey, url);
        
        return url;
        
    } catch (error) {
        console.error('Error generating genmoji:', error);
        // Return fallback image
        return 'images/default-genmoji.svg';
    }
}

/**
 * Extract keywords from post
 */
function extractKeywords(post) {
    const keywords = [];
    
    // From hashtags
    if (post.hashtags && post.hashtags.length > 0) {
        post.hashtags.slice(0, 3).forEach(tag => {
            keywords.push(tag.toLowerCase().replace('#', ''));
        });
    }
    
    // From text
    if (post.text) {
        const words = post.text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3 && w.length < 15);
        words.slice(0, 2).forEach(w => keywords.push(w));
    }
    
    // Add platform
    keywords.push(post.platform);
    
    // Add NYC
    keywords.push('nyc');
    
    return keywords.slice(0, 5);
}

/**
 * Get time of day from timestamp
 */
function getTimeOfDay(timestamp) {
    const hour = new Date(timestamp).getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

/**
 * Extract emotion from post
 */
function extractEmotion(post) {
    const text = (post.text || '').toLowerCase();
    const keywords = (post.hashtags || []).join(' ').toLowerCase();
    const combined = text + ' ' + keywords;
    
    // Emotion detection
    if (/happy|joy|excited|love|fun|smile|laugh/i.test(combined)) return 'happy';
    if (/sad|lonely|miss|blue|down/i.test(combined)) return 'sad';
    if (/anxious|worried|stressed|nervous|tense/i.test(combined)) return 'anxious';
    if (/calm|peaceful|quiet|serene|zen|relax/i.test(combined)) return 'calm';
    
    return 'neutral';
}

/**
 * Batch generate genmojis for multiple posts
 * @param {Array} posts - Array of post objects
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Array>} - Array of posts with genmoji URLs
 */
async function batchGenerateGenmojis(posts, onProgress) {
    const results = [];
    const total = posts.length;
    
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        
        try {
            const genmojiUrl = await generateGenmojiFromPost(post);
            results.push({
                ...post,
                genmoji: genmojiUrl
            });
            
            if (onProgress) {
                onProgress(i + 1, total);
            }
            
            // Rate limiting: wait 500ms between requests
            if (i < posts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
        } catch (error) {
            console.error(`Failed to generate genmoji for post ${i}:`, error);
            results.push({
                ...post,
                genmoji: 'images/default-genmoji.svg'
            });
        }
    }
    
    return results;
}

// Export functions
window.generateGenmojiFromPost = generateGenmojiFromPost;
window.batchGenerateGenmojis = batchGenerateGenmojis;

