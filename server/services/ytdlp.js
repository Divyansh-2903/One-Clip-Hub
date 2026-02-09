const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * yt-dlp wrapper service for fetching video info and downloading
 */
class YtDlpService {
    constructor() {
        this.downloadDir = process.env.DOWNLOAD_DIR || './downloads';
        // Browser to extract cookies from (chrome, firefox, edge, brave, opera, safari)
        this.cookieBrowser = process.env.COOKIE_BROWSER || null;
        // Or path to cookies.txt file
        this.cookiesFile = process.env.COOKIES_FILE || null;

        // Ensure download directory exists
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
     * Set the browser to use for cookies
     */
    setBrowser(browser) {
        const validBrowsers = ['chrome', 'firefox', 'edge', 'brave', 'opera', 'safari', 'vivaldi'];
        if (validBrowsers.includes(browser.toLowerCase())) {
            this.cookieBrowser = browser.toLowerCase();
            return true;
        }
        return false;
    }

    /**
     * Execute yt-dlp command and return output
     */
    executeCommand(args) {
        return new Promise((resolve, reject) => {
            console.log('Executing yt-dlp with args:', args.join(' '));

            // Use python -m yt_dlp since yt-dlp may not be in PATH
            const proc = spawn('python', ['-m', 'yt_dlp', ...args], {
                shell: true,
                cwd: this.downloadDir
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
     * Get video information (metadata) from URL
     */
    async getVideoInfo(url) {
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

            // Extract relevant fields
            return {
                id: info.id,
                title: info.title,
                description: info.description?.substring(0, 500),
                thumbnail: info.thumbnail,
                duration: info.duration,
                durationFormatted: this.formatDuration(info.duration),
                channel: info.channel || info.uploader,
                channelUrl: info.channel_url || info.uploader_url,
                viewCount: info.view_count,
                uploadDate: info.upload_date,
                formats: this.extractFormats(info.formats),
                url: url
            };
        } catch (error) {
            throw new Error(`Failed to get video info: ${error.message}`);
        }
    }

    /**
     * Extract and simplify format options
     */
    extractFormats(formats) {
        if (!formats) return [];

        const videoFormats = [];
        const audioFormats = [];

        // Common quality labels
        const qualityLabels = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'];

        for (const format of formats) {
            // Skip formats without useful info
            if (!format.ext) continue;

            if (format.vcodec && format.vcodec !== 'none') {
                // Video format
                const height = format.height || 0;
                let quality = `${height}p`;
                if (height >= 2160) quality = '4K';

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
            } else if (format.acodec && format.acodec !== 'none') {
                // Audio format
                const abr = format.abr || 128;
                if (!audioFormats.find(f => f.abr === abr)) {
                    audioFormats.push({
                        formatId: format.format_id,
                        ext: format.ext,
                        abr: abr,
                        quality: `${abr}kbps`,
                        filesize: format.filesize || format.filesize_approx,
                        type: 'audio'
                    });
                }
            }
        }

        // Sort by quality (highest first)
        videoFormats.sort((a, b) => b.height - a.height);
        audioFormats.sort((a, b) => b.abr - a.abr);

        return {
            video: videoFormats.slice(0, 6), // Top 6 video qualities
            audio: audioFormats.slice(0, 3)  // Top 3 audio qualities
        };
    }

    /**
     * Format duration from seconds to mm:ss or hh:mm:ss
     */
    formatDuration(seconds) {
        if (!seconds) return null;

        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Download video with specified format
     */
    async downloadVideo(url, format = 'mp4', quality = '720p') {
        const { execSync } = require('child_process');

        try {
            const timestamp = Date.now();
            const outputTemplate = `%(title).50s-${timestamp}.%(ext)s`;

            // Get cookie args for age-restricted videos
            const cookieArgs = this.getCookieArgs().join(' ');

            let formatSpec;
            let extraArgs = '';

            if (format.toLowerCase() === 'mp3') {
                extraArgs = '-x --audio-format mp3 --audio-quality 0';
            } else {
                if (quality === '4K' || quality === '2160p') {
                    formatSpec = 'bestvideo[height<=2160]+bestaudio/best[height<=2160]';
                } else if (quality === '1080p') {
                    formatSpec = 'bestvideo[height<=1080]+bestaudio/best[height<=1080]';
                } else if (quality === '720p') {
                    formatSpec = 'bestvideo[height<=720]+bestaudio/best[height<=720]';
                } else if (quality === '480p') {
                    formatSpec = 'bestvideo[height<=480]+bestaudio/best[height<=480]';
                } else {
                    formatSpec = 'bestvideo[height<=360]+bestaudio/best[height<=360]';
                }
                extraArgs = `-f "${formatSpec}" --merge-output-format mp4`;
            }

            const cmd = `python -m yt_dlp ${cookieArgs} -o "${outputTemplate}" --no-playlist --no-warnings ${extraArgs} "${url}"`;
            console.log('Executing download command:', cmd);

            execSync(cmd, {
                cwd: this.downloadDir,
                stdio: 'inherit',
                timeout: 300000 // 5 minutes timeout
            });

            // Find the downloaded file - filter by the expected extension
            const expectedExt = format.toLowerCase() === 'mp3' ? '.mp3' : '.mp4';
            let files = fs.readdirSync(this.downloadDir)
                .filter(f => f.includes(timestamp.toString()) && f.endsWith(expectedExt))
                .map(f => path.join(this.downloadDir, f));

            console.log('Files found after download:', files);

            // If no files with expected extension, look for any file with timestamp
            if (files.length === 0) {
                files = fs.readdirSync(this.downloadDir)
                    .filter(f => f.includes(timestamp.toString()))
                    .map(f => path.join(this.downloadDir, f));

                // Sort by size descending to get the merged file (largest)
                files.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
            }

            if (files.length === 0) {
                throw new Error('Download completed but file not found');
            }

            // Get the largest file (the merged output)
            const filePath = files[0];
            const stats = fs.statSync(filePath);

            // Clean up temp webm files
            fs.readdirSync(this.downloadDir)
                .filter(f => f.includes(timestamp.toString()) && (f.endsWith('.webm') || f.includes('.f251.') || f.includes('.f')))
                .filter(f => path.join(this.downloadDir, f) !== filePath)
                .forEach(f => {
                    try {
                        fs.unlinkSync(path.join(this.downloadDir, f));
                        console.log('Cleaned up temp file:', f);
                    } catch (e) {
                        console.log('Could not delete temp file:', f);
                    }
                });

            return {
                success: true,
                filePath: filePath,
                fileName: path.basename(filePath),
                fileSize: stats.size,
                format: format,
                quality: quality
            };
        } catch (error) {
            console.error('Download error:', error.message);
            throw new Error(`Failed to download video: ${error.message}`);
        }
    }

    /**
     * Start download and return progress updates via callback
     */
    downloadWithProgress(url, format, quality, progressCallback) {
        return new Promise((resolve, reject) => {
            const timestamp = Date.now();
            const outputTemplate = path.join(this.downloadDir, `%(title)s-${timestamp}.%(ext)s`);

            let args = [
                '-o', outputTemplate,
                '--no-playlist',
                '--no-warnings',
                '--newline',
                '--progress',
            ];

            if (format.toLowerCase() === 'mp3') {
                args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
            } else {
                let formatSpec;
                if (quality === '4K' || quality === '2160p') {
                    formatSpec = 'bestvideo[height<=2160]+bestaudio/best[height<=2160]';
                } else if (quality === '1080p') {
                    formatSpec = 'bestvideo[height<=1080]+bestaudio/best[height<=1080]';
                } else if (quality === '720p') {
                    formatSpec = 'bestvideo[height<=720]+bestaudio/best[height<=720]';
                } else if (quality === '480p') {
                    formatSpec = 'bestvideo[height<=480]+bestaudio/best[height<=480]';
                } else {
                    formatSpec = 'bestvideo[height<=360]+bestaudio/best[height<=360]';
                }
                args.push('-f', formatSpec, '--merge-output-format', 'mp4');
            }

            args.push(url);

            // Use python -m yt_dlp since yt-dlp may not be in PATH
            const process = spawn('python', ['-m', 'yt_dlp', ...args], { shell: true });
            let lastProgress = 0;

            process.stdout.on('data', (data) => {
                const output = data.toString();
                // Parse progress from output
                const progressMatch = output.match(/(\d+\.?\d*)%/);
                if (progressMatch) {
                    const progress = parseFloat(progressMatch[1]);
                    if (progress > lastProgress) {
                        lastProgress = progress;
                        progressCallback({ progress, status: 'downloading' });
                    }
                }
            });

            process.stderr.on('data', (data) => {
                console.error('yt-dlp stderr:', data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) {
                    // Find the downloaded file
                    const files = fs.readdirSync(this.downloadDir)
                        .filter(f => f.includes(timestamp.toString()))
                        .map(f => path.join(this.downloadDir, f));

                    if (files.length > 0) {
                        const filePath = files[0];
                        const stats = fs.statSync(filePath);
                        resolve({
                            success: true,
                            filePath,
                            fileName: path.basename(filePath),
                            fileSize: stats.size
                        });
                    } else {
                        reject(new Error('Download completed but file not found'));
                    }
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}`));
                }
            });

            process.on('error', (err) => {
                reject(new Error(`Failed to start yt-dlp: ${err.message}`));
            });
        });
    }
}

module.exports = new YtDlpService();
