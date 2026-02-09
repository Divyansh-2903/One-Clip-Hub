require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const youtubeRoutes = require('./routes/youtube');
const instagramRoutes = require('./routes/instagram');
const pinterestRoutes = require('./routes/pinterest');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow multiple frontend ports
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Media Downloader API is running (YouTube, Instagram, Pinterest)',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/youtube', youtubeRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/pinterest', pinterestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Thumbnail proxy to bypass CORS restrictions
app.get('/api/proxy/thumbnail', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).json({ error: 'URL parameter required' });
        }

        const https = require('https');
        const http = require('http');
        const protocol = imageUrl.startsWith('https') ? https : http;

        protocol.get(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*'
            }
        }, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                const redirectProtocol = response.headers.location.startsWith('https') ? https : http;
                redirectProtocol.get(response.headers.location, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'image/*'
                    }
                }, (redirectResponse) => {
                    res.set('Content-Type', redirectResponse.headers['content-type'] || 'image/jpeg');
                    res.set('Cache-Control', 'public, max-age=86400');
                    redirectResponse.pipe(res);
                }).on('error', (err) => {
                    console.error('Redirect proxy error:', err);
                    res.status(500).json({ error: 'Failed to fetch image' });
                });
                return;
            }

            res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=86400');
            response.pipe(res);
        }).on('error', (err) => {
            console.error('Proxy error:', err);
            res.status(500).json({ error: 'Failed to fetch image' });
        });
    } catch (error) {
        console.error('Thumbnail proxy error:', error);
        res.status(500).json({ error: 'Proxy error' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📺 YouTube API available at http://localhost:${PORT}/api/youtube`);
    console.log(`📸 Instagram API available at http://localhost:${PORT}/api/instagram`);
    console.log(`📌 Pinterest API available at http://localhost:${PORT}/api/pinterest`);
});

module.exports = app;
