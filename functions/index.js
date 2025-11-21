/**
 * Firebase Cloud Functions for Daily Ritual
 *
 * generateGenmoji: Server-side AI emoji generation using Hugging Face API
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Cost control
setGlobalOptions({ maxInstances: 10 });

// Hugging Face API Configuration
const HF_API_KEY = process.env.HF_API_KEY;

// Available models
const MODELS = {
    sticker: 'artificialguybr/StickersRedmond',
    cute: 'alvdansen/littletinies',
    emoji: 'Yntec/epiCPhotoGasm',
    abstract: 'plasmo/woolitize'
};

/**
 * Generate Genmoji using Hugging Face API
 *
 * Request body:
 * {
 *   keywords: string[],
 *   platform: string,
 *   timeOfDay: string,
 *   emotion: string
 * }
 *
 * Returns: PNG image buffer
 */
exports.generateGenmoji = onRequest(
    { cors: true, maxInstances: 5 },
    async (req, res) => {
        // CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');

        // Handle preflight
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        // Only allow POST
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const { keywords = [], platform = 'instagram', timeOfDay = 'afternoon', emotion = 'neutral' } = req.body;

            logger.info('Generating genmoji', { keywords, platform, timeOfDay, emotion });

            // Create optimized prompt
            const prompt = createPrompt(keywords, platform, timeOfDay, emotion);

            logger.info('Generated prompt', { prompt });

            // Select model based on platform
            const model = selectModel(platform);

            // Call Hugging Face API
            const imageBuffer = await callHuggingFaceAPI(model, prompt);

            // Return image
            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
            res.send(imageBuffer);

            logger.info('Genmoji generated successfully');

        } catch (error) {
            logger.error('Error generating genmoji', error);

            // Return fallback SVG
            const fallbackSVG = createFallbackSVG(req.body.keywords || []);
            res.set('Content-Type', 'image/svg+xml');
            res.send(fallbackSVG);
        }
    }
);

/**
 * Create optimized prompt for genmoji generation
 */
function createPrompt(keywords, platform, timeOfDay, emotion) {
    const mainKeyword = keywords[0] || 'urban';

    // Platform styles
    const styles = {
        instagram: 'aesthetic minimalist',
        tiktok: 'dynamic playful',
        twitter: 'simple iconic',
        facebook: 'friendly warm'
    };

    const style = styles[platform] || 'simple clean';

    // Time-based colors
    const colors = {
        morning: 'warm yellow orange',
        afternoon: 'bright blue',
        evening: 'purple pink',
        night: 'deep blue navy'
    };

    const color = colors[timeOfDay] || 'bright blue';

    // Emotion mapping
    const emotions = {
        happy: 'cheerful joyful',
        sad: 'melancholy soft',
        anxious: 'tense energetic',
        calm: 'peaceful serene',
        neutral: 'balanced'
    };

    const mood = emotions[emotion] || 'neutral';

    // Generate prompt
    const templates = [
        `cute ${mainKeyword} emoji sticker, ${mood} expression, ${style} style, ${color} color scheme, white background, flat design, simple shapes, vector art, no text`,
        `minimalist ${mainKeyword} icon, ${mood} mood, ${color} tones, ${style}, clean design, sticker style, white background`,
        `kawaii ${mainKeyword} character, ${mood} feeling, ${color} palette, ${style}, chibi style, white background, cute simple design`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Select model based on platform
 */
function selectModel(platform) {
    const modelMap = {
        instagram: MODELS.sticker,
        tiktok: MODELS.cute,
        twitter: MODELS.emoji,
        facebook: MODELS.sticker
    };

    return modelMap[platform] || MODELS.sticker;
}

/**
 * Call Hugging Face Inference API
 */
async function callHuggingFaceAPI(model, prompt, retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    headers: {
                        'Authorization': `Bearer ${HF_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            negative_prompt: "realistic, photo, photograph, text, words, letters, watermark, signature, complex, detailed, ugly, blurry",
                            num_inference_steps: 20,
                            guidance_scale: 7.5,
                            width: 512,
                            height: 512
                        },
                        options: {
                            wait_for_model: true,
                            use_cache: true
                        }
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`HF API Error ${response.status}: ${error}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);

        } catch (error) {
            logger.warn(`HF API attempt ${i + 1} failed`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

/**
 * Create fallback SVG when API fails
 */
function createFallbackSVG(keywords) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const emojis = ['✨', '🎨', '🌟', '💫', '🎭', '🌈', '🎪', '🎯'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    return `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />
                </linearGradient>
            </defs>
            <circle cx="256" cy="256" r="240" fill="url(#grad)" opacity="0.9"/>
            <text x="256" y="320" font-size="180" text-anchor="middle" fill="white">${emoji}</text>
        </svg>
    `;
}
