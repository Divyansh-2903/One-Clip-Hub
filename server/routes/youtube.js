const express = require('express');
const router = express.Router();
const ytdlpService = require('../services/ytdlp');

/**
 * POST /api/youtube/info
 * Fetch video metadata from YouTube URL
 */
router.post('/info', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate YouTube URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
        if (!youtubeRegex.test(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdlpService.getVideoInfo(url);
        res.json(info);
    } catch (error) {
        console.error('Error fetching video info:', error);

        // Parse common yt-dlp errors for user-friendly messages
        let userMessage = error.message;
        const isAgeRestricted = error.message.includes('Sign in to confirm your age') ||
            error.message.includes('age-restricted') ||
            error.message.includes('confirm you');

        if (isAgeRestricted) {
            userMessage = 'This video is age-restricted. Configure your browser in Settings to access age-restricted content.';
        } else if (error.message.includes('Video unavailable')) {
            userMessage = 'This video is unavailable or private.';
        } else if (error.message.includes('Private video')) {
            userMessage = 'This is a private video and cannot be accessed.';
        }

        res.status(500).json({ error: userMessage, isAgeRestricted });
    }
});

/**
 * POST /api/youtube/set-browser
 * Configure browser for cookie-based authentication
 */
router.post('/set-browser', (req, res) => {
    try {
        const { browser } = req.body;

        if (!browser) {
            return res.status(400).json({ error: 'Browser name is required' });
        }

        const validBrowsers = ['chrome', 'firefox', 'edge', 'brave', 'opera', 'safari', 'vivaldi'];
        if (!validBrowsers.includes(browser.toLowerCase())) {
            return res.status(400).json({
                error: 'Invalid browser. Supported: ' + validBrowsers.join(', ')
            });
        }

        const success = ytdlpService.setBrowser(browser);
        if (success) {
            res.json({
                success: true,
                message: `Browser set to ${browser}. Age-restricted videos should now work.`,
                browser: browser.toLowerCase()
            });
        } else {
            res.status(400).json({ error: 'Failed to set browser' });
        }
    } catch (error) {
        console.error('Error setting browser:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/youtube/browser-status
 * Get current browser configuration status
 */
router.get('/browser-status', (req, res) => {
    res.json({
        browserConfigured: !!ytdlpService.cookieBrowser,
        browser: ytdlpService.cookieBrowser,
        cookiesFile: ytdlpService.cookiesFile ? true : false
    });
});

/**
 * POST /api/youtube/download
 * Download video with specified format and quality
 */
router.post('/download', async (req, res) => {
    try {
        const { url, format = 'mp4', quality = '720p' } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate YouTube URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
        if (!youtubeRegex.test(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const result = await ytdlpService.downloadVideo(url, format, quality);

        // Send the file for download
        res.download(result.filePath, result.fileName, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            // Optionally delete file after sending
            // fs.unlinkSync(result.filePath);
        });
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/youtube/download-info
 * Start download and return file info (for database storage)
 * Does not stream the file - just returns metadata
 */
router.post('/download-info', async (req, res) => {
    try {
        const { url, format = 'mp4', quality = '720p' } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const result = await ytdlpService.downloadVideo(url, format, quality);

        res.json({
            success: true,
            fileName: result.fileName,
            fileSize: result.fileSize,
            format: result.format,
            quality: result.quality,
            downloadUrl: `/api/youtube/file/${encodeURIComponent(result.fileName)}`
        });
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/youtube/file/:filename
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
