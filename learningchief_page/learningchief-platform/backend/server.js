require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// API routes
app.use('/api', apiRoutes);

// API 404 handler - ensures unknown API routes return JSON, not HTML
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// API error handler - ensures API errors return JSON, not HTML
app.use('/api', (err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        error: err.message || 'Internal server error',
        success: false
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Catch-all for SPA - serve index.html for unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// General error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🌟 LearningChief server running at http://localhost:${PORT}`);
});
