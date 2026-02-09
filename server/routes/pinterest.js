const express = require('express');
const router = express.Router();
const pinterestService = require('../services/pinterest');

/**
 * POST /api/pinterest/info
 * Fetch pin metadata from Pinterest URL
 */
router.post('/info', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate Pinterest URL
        const pinterestRegex = /^(https?:\/\/)?(www\.)?(pinterest\.com|pin\.it)\/.+/i;
        if (!pinterestRegex.test(url)) {
            return res.status(400).json({ error: 'Invalid Pinterest URL' });
        }

        const info = await pinterestService.getContentInfo(url);
        res.json(info);
    } catch (error) {
        console.error('Error fetching Pinterest info:', error);

        let userMessage = error.message;
        if (error.message.includes('login') || error.message.includes('Login')) {
            userMessage = 'This content requires login. Try configuring your browser in Settings.';
        }

        res.status(500).json({ error: userMessage });
    }
});

/**
 * POST /api/pinterest/download-info
 * Download pin and return file info
 */
router.post('/download-info', async (req, res) => {
    try {
        const { url, format = 'jpg' } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const result = await pinterestService.downloadContent(url, format);

        res.json({
            success: true,
            fileName: result.fileName,
            fileSize: result.fileSize,
            format: result.format,
            downloadUrl: `/api/pinterest/file/${encodeURIComponent(result.fileName)}`
        });
    } catch (error) {
        console.error('Error downloading Pinterest content:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pinterest/file/:filename
 * Serve a downloaded file
 */
router.get('/file/:filename', (req, res) => {
    const path = require('path');
    const fs = require('fs');

    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(process.env.DOWNLOAD_DIR || './downloads', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, filename);
});

module.exports = router;
