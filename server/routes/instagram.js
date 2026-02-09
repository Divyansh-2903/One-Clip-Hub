const express = require('express');
const router = express.Router();
const instagramService = require('../services/instagram');

/**
 * POST /api/instagram/info
 * Fetch content metadata from Instagram URL
 */
router.post('/info', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate Instagram URL
        const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i;
        if (!instagramRegex.test(url)) {
            return res.status(400).json({ error: 'Invalid Instagram URL' });
        }

        const info = await instagramService.getContentInfo(url);
        res.json(info);
    } catch (error) {
        console.error('Error fetching Instagram info:', error);

        let userMessage = error.message;
        if (error.message.includes('login') || error.message.includes('Login')) {
            userMessage = 'This content requires login. Try configuring your browser in Settings.';
        } else if (error.message.includes('private') || error.message.includes('Private')) {
            userMessage = 'This is a private post and cannot be accessed.';
        }

        res.status(500).json({ error: userMessage });
    }
});

/**
 * POST /api/instagram/download-info
 * Download content and return file info
 */
router.post('/download-info', async (req, res) => {
    try {
        const { url, format = 'mp4', quality = 'Original' } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const result = await instagramService.downloadContent(url, format, quality);

        res.json({
            success: true,
            fileName: result.fileName,
            fileSize: result.fileSize,
            format: result.format,
            quality: result.quality,
            downloadUrl: `/api/instagram/file/${encodeURIComponent(result.fileName)}`
        });
    } catch (error) {
        console.error('Error downloading Instagram content:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/instagram/file/:filename
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
