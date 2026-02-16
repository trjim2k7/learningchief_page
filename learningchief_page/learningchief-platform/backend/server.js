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

// Paths
const appFrontendDir = path.join(__dirname, '../frontend');
const appAssetsDir = path.join(__dirname, '../assets');
const mirrorSiteDir = path.join(__dirname, '../../learningchief.com');

// Serve full interactive app under /app
app.use('/app', express.static(appFrontendDir));
app.use('/app-assets', express.static(appAssetsDir));

// Serve mirrored branded site at /
app.use(express.static(mirrorSiteDir));
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

// App entry
app.get('/app', (req, res) => {
    res.sendFile(path.join(appFrontendDir, 'index.html'));
});

// Root entry -> branded mirrored site
app.get('/', (req, res) => {
    res.sendFile(path.join(mirrorSiteDir, 'index.html'));
});

// Catch-all: try mirror first, fallback to mirror index
app.get('*', (req, res) => {
    const requested = path.join(mirrorSiteDir, req.path);
    res.sendFile(requested, (err) => {
        if (err) {
            res.sendFile(path.join(mirrorSiteDir, 'index.html'));
        }
    });
});

// General error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🌟 LearningChief server running at http://localhost:${PORT}`);
});
