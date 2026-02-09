const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Pinterest pin downloader service using yt-dlp
 * Supports: Images and video pins
 */
class PinterestService {
    constructor() {
        this.downloadDir = process.env.DOWNLOAD_DIR || './downloads';
        this.cookieBrowser = process.env.COOKIE_BROWSER || null;
        this.cookiesFile = process.env.COOKIES_FILE || null;

        if (!fs.existsSync(this.downloadDir)) {
            fs.mkdirSync(this.downloadDir, { recursive: true });
        }
    }

    /**
     * Get cookie arguments for yt-dlp
     */
    getCookieArgs() {
        if (this.cookieBrowser) {
            return ['--cookies-from-browser', this.cookieBrowser];
        }
        if (this.cookiesFile && fs.existsSync(this.cookiesFile)) {
            return ['--cookies', this.cookiesFile];
        }
        return [];
    }

    /**
     * Execute yt-dlp command and return output
     */
    executeCommand(args) {
        return new Promise((resolve, reject) => {
            console.log('Executing yt-dlp (Pinterest) with args:', args.join(' '));

            const proc = spawn('python', ['-m', 'yt_dlp', ...args], {
                cwd: this.downloadDir,
                windowsHide: true
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (data) => {
                const str = data.toString();
                stdout += str;
                console.log('yt-dlp stdout:', str.substring(0, 100));
            });

            proc.stderr.on('data', (data) => {
                stderr += data.toString();
                console.log('yt-dlp stderr:', data.toString().substring(0, 200));
            });

            proc.on('close', (code) => {
                console.log('yt-dlp exited with code:', code);
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(stderr || `yt-dlp exited with code ${code}`));
                }
            });

            proc.on('error', (err) => {
                console.error('Failed to start yt-dlp:', err);
                reject(new Error(`Failed to start yt-dlp: ${err.message}`));
            });
        });
    }

    /**
     * Get pin information from Pinterest URL
     */
    async getContentInfo(url) {
        try {
            const cookieArgs = this.getCookieArgs();
            const args = [
                ...cookieArgs,
                '--dump-json',
                '--no-playlist',
                '--no-warnings',
                url
            ];

            const output = await this.executeCommand(args);
            const info = JSON.parse(output);

            // Determine if it's a video or image
            const isVideo = info.duration && info.duration > 0;

            return {
                id: info.id,
                title: info.title || info.description?.substring(0, 100) || 'Pinterest Pin',
                description: info.description?.substring(0, 500),
                thumbnail: info.thumbnail,
                duration: info.duration || 0,
                durationFormatted: this.formatDuration(info.duration),
                channel: info.uploader || 'Pinterest User',
                channelUrl: info.uploader_url,
                uploadDate: info.upload_date,
                formats: this.extractFormats(info.formats || [], isVideo),
                url: url,
                contentType: isVideo ? 'video' : 'image'
            };
        } catch (error) {
            throw new Error(`Failed to get Pinterest pin info: ${error.message}`);
        }
    }

    /**
     * Extract and simplify format options
     */
    extractFormats(formats, isVideo) {
        if (!formats || formats.length === 0) {
            return {
                video: isVideo ? [{ quality: 'Original', type: 'video' }] : [],
                image: !isVideo ? [{ quality: 'Original', ext: 'jpg', type: 'image' }] : []
            };
        }

        const videoFormats = [];
        const imageFormats = [];

        for (const format of formats) {
            if (!format.ext) continue;

            if (format.vcodec && format.vcodec !== 'none') {
                const height = format.height || 0;
                let quality = height > 0 ? `${height}p` : 'Original';

                if (!videoFormats.find(f => f.quality === quality)) {
                    videoFormats.push({
                        formatId: format.format_id,
                        ext: format.ext,
                        quality: quality,
                        height: height,
                        filesize: format.filesize || format.filesize_approx,
                        type: 'video'
                    });
                }
            } else if (['jpg', 'jpeg', 'png', 'webp'].includes(format.ext)) {
                if (!imageFormats.find(f => f.ext === format.ext)) {
                    imageFormats.push({
                        formatId: format.format_id,
                        ext: format.ext,
                        quality: 'Original',
                        filesize: format.filesize,
                        type: 'image'
                    });
                }
            }
        }

        videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0));

        return {
            video: videoFormats.length > 0 ? videoFormats : (isVideo ? [{ quality: 'Original', type: 'video' }] : []),
            image: imageFormats.length > 0 ? imageFormats : (!isVideo ? [{ quality: 'Original', ext: 'jpg', type: 'image' }] : [])
        };
    }

    /**
     * Format duration from seconds
     */
    formatDuration(seconds) {
        if (!seconds) return null;

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Download Pinterest content
     */
    async downloadContent(url, format = 'jpg') {
        try {
            const timestamp = Date.now();
            const outputTemplate = `%(title).50s-${timestamp}.%(ext)s`;

            const cookieArgs = this.getCookieArgs();
            const args = [
                ...cookieArgs,
                '-o', outputTemplate,
                '--no-playlist',
                '--no-warnings',
                url
            ];

            console.log('Executing download command with args:', args);

            const { spawnSync } = require('child_process');
            const result = spawnSync('python', ['-m', 'yt_dlp', ...args], {
                cwd: this.downloadDir,
                timeout: 300000,
                windowsHide: true
            });

            if (result.error) {
                throw result.error;
            }

            if (result.status !== 0) {
                throw new Error(result.stderr?.toString() || `yt-dlp exited with code ${result.status}`);
            }

            // Find downloaded file
            const files = fs.readdirSync(this.downloadDir)
                .filter(f => f.includes(timestamp.toString()))
                .map(f => path.join(this.downloadDir, f));

            if (files.length === 0) {
                throw new Error('Download completed but file not found');
            }

            // Get the largest file
            files.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
            const filePath = files[0];
            const stats = fs.statSync(filePath);

            // Determine actual format from file extension
            const actualFormat = path.extname(filePath).slice(1).toUpperCase() || format;

            return {
                success: true,
                filePath: filePath,
                fileName: path.basename(filePath),
                fileSize: stats.size,
                format: actualFormat
            };
        } catch (error) {
            console.error('Download error:', error.message);
            throw new Error(`Failed to download Pinterest content: ${error.message}`);
        }
    }
}

module.exports = new PinterestService();
