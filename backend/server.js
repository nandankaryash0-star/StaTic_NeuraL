require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// ElevenLabs Voices API - Fetch available voices
app.get('/api/voices', async (req, res) => {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }

        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const data = await response.json();

        // Return simplified voice data for frontend
        const voices = data.voices.map(voice => ({
            voice_id: voice.voice_id,
            name: voice.name,
            category: voice.category,
            description: voice.labels?.description || '',
            preview_url: voice.preview_url,
            labels: voice.labels
        }));

        res.json({ voices });
    } catch (error) {
        console.error('Error fetching voices:', error);
        res.status(500).json({ error: 'Failed to fetch voices from ElevenLabs' });
    }
});

// Gemini Vision API - Analyze images
app.post('/api/analyze-image', express.json({ limit: '10mb' }), async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const { image, mimeType, prompt } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Use Gemini API to analyze the image
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inline_data: {
                                    mime_type: mimeType || 'image/jpeg',
                                    data: image // base64 encoded
                                }
                            },
                            {
                                text: prompt || 'Describe this image in detail. What do you see? If there is any text, read it out.'
                            }
                        ]
                    }]
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gemini API error');
        }

        const data = await response.json();
        const description = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not analyze image';

        res.json({ description });
    } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Sarthi Backend is running', status: 'OK' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong!'
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
