const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { prompts } = require('../secure-prompts');

// Rate limiting simple implementation
const requestCounts = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = requestCounts.get(ip) || [];
    const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);

    if (recentRequests.length >= RATE_LIMIT) {
        return false;
    }

    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    return true;
}

// Initialize Gemini
function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }
    return new GoogleGenerativeAI(apiKey);
}

// Generate AI Worksheet
router.post('/generate-ai-worksheet', async (req, res) => {
    try {
        // Rate limiting
        if (!checkRateLimit(req.ip)) {
            return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
        }

        const { subject, year, difficulty, topic, questionCount, includeRevision } = req.body;

        // Validate inputs
        if (!subject || !['math', 'english'].includes(subject)) {
            return res.status(400).json({ error: 'Invalid subject. Must be "math" or "english".' });
        }
        if (!year || year < 1 || year > 6) {
            return res.status(400).json({ error: 'Invalid year. Must be 1-6.' });
        }
        if (!difficulty || !['normal', 'advanced'].includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty. Must be "normal" or "advanced".' });
        }

        const count = Math.min(Math.max(questionCount || 10, 5), 20);

        // Get appropriate prompt
        const prompt = subject === 'math'
            ? prompts.mathWorksheet(year, difficulty, topic, count)
            : prompts.englishWorksheet(year, difficulty, topic, count);

        // Call Gemini API
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const questions = JSON.parse(jsonMatch[0]);

        // If revision mode, we'll add a note for the client to mix in revision questions
        res.json({
            success: true,
            questions,
            metadata: {
                subject,
                year,
                difficulty,
                topic: topic || 'Mixed',
                includeRevision,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('AI Generation Error:', error);

        if (error.message.includes('API_KEY')) {
            return res.status(500).json({ error: 'AI service not configured. Please use standard generation.' });
        }

        res.status(500).json({ error: 'Failed to generate worksheet. Please try again.' });
    }
});

// Generate Tutor Explanation
router.post('/generate-tutor-explanation', async (req, res) => {
    try {
        if (!checkRateLimit(req.ip)) {
            return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
        }

        const { question, subject, year } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required.' });
        }

        const prompt = prompts.tutorExplanation(question, subject || 'math', year || 3);

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const explanation = JSON.parse(jsonMatch[0]);

        res.json({
            success: true,
            explanation
        });

    } catch (error) {
        console.error('Tutor Explanation Error:', error);
        res.status(500).json({ error: 'Failed to generate explanation. Please try again.' });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        aiConfigured: !!process.env.GEMINI_API_KEY
    });
});

// Smart Marker - Mark student work from uploaded images
router.post('/mark-work', async (req, res) => {
    try {
        // Rate limiting
        if (!checkRateLimit(req.ip)) {
            return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
        }

        const { image, subject, yearGroup, worksheetContext } = req.body;

        // Validate inputs
        if (!image) {
            return res.status(400).json({ error: 'No image provided.' });
        }

        // Check if image is base64
        if (!image.startsWith('data:image/')) {
            return res.status(400).json({ error: 'Invalid image format. Please provide a base64 encoded image.' });
        }

        const year = yearGroup || 3;
        const subjectType = subject || 'math';

        // Get the prompt
        const prompt = prompts.markWork(subjectType, year, worksheetContext);

        // Extract base64 data and mime type
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ error: 'Invalid image format.' });
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Call Gemini Vision API
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const markingResult = JSON.parse(jsonMatch[0]);

        // Add metadata
        markingResult.metadata = {
            subject: subjectType,
            yearGroup: year,
            markedAt: new Date().toISOString()
        };

        res.json(markingResult);

    } catch (error) {
        console.error('Smart Marker Error:', error);

        if (error.message.includes('API_KEY')) {
            return res.status(500).json({
                success: false,
                error: 'AI service not configured.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to mark work. Please try again or use a clearer image.'
        });
    }
});

module.exports = router;
