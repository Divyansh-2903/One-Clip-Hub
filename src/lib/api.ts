// Check if user has opted for local backend
const useLocalBackend = localStorage.getItem('USE_LOCAL_BACKEND') === 'true';
const API_BASE_URL = useLocalBackend
    ? 'http://localhost:3001'
    : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

console.log('API Base URL:', API_BASE_URL, '(Local Mode:', useLocalBackend, ')');

export interface VideoInfo {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    duration: number;
    durationFormatted: string;
    channel: string;
    channelUrl?: string;
    viewCount?: number;
    uploadDate?: string;
    formats: {
        video: Array<{
            formatId: string;
            ext: string;
            quality: string;
            height: number;
            filesize?: number;
            type: string;
        }>;
        audio: Array<{
            formatId: string;
            ext: string;
            abr: number;
            quality: string;
            filesize?: number;
            type: string;
        }>;
    };
    url: string;
}

export interface DownloadResult {
    success: boolean;
    fileName: string;
    fileSize: number;
    format: string;
    quality: string;
    downloadUrl: string;
}

/**
 * Fetch video information from YouTube URL
 */
export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/youtube/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch video info');
        }

        return response.json();
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on port 3001.');
        }
        throw error;
    }
}

/**
 * Download video and get file info
 */
export async function downloadVideo(
    url: string,
    format: string,
    quality: string
): Promise<DownloadResult> {
    const response = await fetch(`${API_BASE_URL}/api/youtube/download-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format, quality }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download video');
    }

    return response.json();
}

/**
 * Get direct download URL for a video
 */
export function getDownloadUrl(url: string, format: string, quality: string): string {
    const params = new URLSearchParams({ url, format, quality });
    return `${API_BASE_URL}/api/youtube/download?${params}`;
}

/**
 * Get file download URL
 */
export function getFileUrl(fileName: string): string {
    return `${API_BASE_URL}/api/youtube/file/${encodeURIComponent(fileName)}`;
}

/**
 * Check if backend is healthy
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.ok;
    } catch {
        return false;
    }
}

export interface BrowserStatus {
    browserConfigured: boolean;
    browser: string | null;
    cookiesFile: boolean;
}

/**
 * Get current browser configuration status
 */
export async function getBrowserStatus(): Promise<BrowserStatus> {
    const response = await fetch(`${API_BASE_URL}/api/youtube/browser-status`);
    return response.json();
}

/**
 * Set browser for cookie-based authentication (for age-restricted videos)
 */
export async function setBrowser(browser: string): Promise<{ success: boolean; message: string; browser: string }> {
    const response = await fetch(`${API_BASE_URL}/api/youtube/set-browser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ browser }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set browser');
    }

    return response.json();
}

// =====================
// Instagram API
// =====================

export interface InstagramInfo {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    duration: number;
    durationFormatted: string | null;
    channel: string;
    channelUrl?: string;
    viewCount?: number;
    uploadDate?: string;
    formats: {
        video: Array<{ quality: string; type: string }>;
        image: Array<{ quality: string; ext?: string; type: string }>;
    };
    url: string;
    contentType: 'video' | 'image';
}

/**
 * Fetch content information from Instagram URL
 */
export async function fetchInstagramInfo(url: string): Promise<InstagramInfo> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/instagram/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch Instagram info');
        }

        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on port 3001.');
        }
        throw error;
    }
}

/**
 * Download Instagram content
 */
export async function downloadInstagram(
    url: string,
    format: string,
    quality: string
): Promise<DownloadResult> {
    const response = await fetch(`${API_BASE_URL}/api/instagram/download-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format, quality }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download Instagram content');
    }

    return response.json();
}

/**
 * Get Instagram file download URL
 */
export function getInstagramFileUrl(fileName: string): string {
    return `${API_BASE_URL}/api/instagram/file/${encodeURIComponent(fileName)}`;
}

// =====================
// Pinterest API
// =====================

export interface PinterestInfo {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    duration: number;
    durationFormatted: string | null;
    channel: string;
    channelUrl?: string;
    uploadDate?: string;
    formats: {
        video: Array<{ quality: string; type: string }>;
        image: Array<{ quality: string; ext?: string; type: string }>;
    };
    url: string;
    contentType: 'video' | 'image';
}

/**
 * Fetch pin information from Pinterest URL
 */
export async function fetchPinterestInfo(url: string): Promise<PinterestInfo> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/pinterest/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch Pinterest info');
        }

        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on port 3001.');
        }
        throw error;
    }
}

/**
 * Download Pinterest content
 */
export async function downloadPinterest(
    url: string,
    format: string
): Promise<DownloadResult> {
    const response = await fetch(`${API_BASE_URL}/api/pinterest/download-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download Pinterest content');
    }

    return response.json();
}

/**
 * Get Pinterest file download URL
 */
export function getPinterestFileUrl(fileName: string): string {
    return `${API_BASE_URL}/api/pinterest/file/${encodeURIComponent(fileName)}`;
}

// Proxy thumbnail to avoid CORS issues with Instagram/Pinterest
export function getProxyThumbnailUrl(originalUrl: string): string {
    return `${API_BASE_URL}/api/proxy/thumbnail?url=${encodeURIComponent(originalUrl)}`;
}


// =====================
// TikTok API
// =====================

export interface TikTokInfo {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    duration: number;
    durationFormatted: string | null;
    channel: string;
    channelUrl?: string;
    viewCount?: number;
    likeCount?: number;
    uploadDate?: string;
    url: string;
    contentType: 'video';
}

export async function fetchTikTokInfo(url: string): Promise<TikTokInfo> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tiktok/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch TikTok info');
        }

        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on port 3001.');
        }
        throw error;
    }
}

export async function downloadTikTok(url: string, format: string, quality: string): Promise<DownloadResult> {
    const response = await fetch(`${API_BASE_URL}/api/tiktok/download-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format, quality }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download TikTok content');
    }

    return response.json();
}

export function getTikTokFileUrl(fileName: string): string {
    return `${API_BASE_URL}/api/tiktok/file/${encodeURIComponent(fileName)}`;
}

// =====================
// Twitter/X API
// =====================

export interface TwitterInfo {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    duration: number;
    durationFormatted: string | null;
    channel: string;
    channelUrl?: string;
    viewCount?: number;
    likeCount?: number;
    retweetCount?: number;
    uploadDate?: string;
    url: string;
    contentType: 'video';
}

export async function fetchTwitterInfo(url: string): Promise<TwitterInfo> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/twitter/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch Twitter/X info');
        }

        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on port 3001.');
        }
        throw error;
    }
}

export async function downloadTwitter(url: string, format: string, quality: string): Promise<DownloadResult> {
    const response = await fetch(`${API_BASE_URL}/api/twitter/download-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format, quality }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download Twitter/X content');
    }

    return response.json();
}

export function getTwitterFileUrl(fileName: string): string {
    return `${API_BASE_URL}/api/twitter/file/${encodeURIComponent(fileName)}`;
}

// =====================
// Facebook API
// =====================

export interface FacebookInfo {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    duration: number;
    durationFormatted: string | null;
    channel: string;
    channelUrl?: string;
    viewCount?: number;
    uploadDate?: string;
    url: string;
    contentType: 'video';
}

export async function fetchFacebookInfo(url: string): Promise<FacebookInfo> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/facebook/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch Facebook info');
        }

        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on port 3001.');
        }
        throw error;
    }
}

export async function downloadFacebook(url: string, format: string, quality: string): Promise<DownloadResult> {
    const response = await fetch(`${API_BASE_URL}/api/facebook/download-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format, quality }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download Facebook content');
    }

    return response.json();
}

export function getFacebookFileUrl(fileName: string): string {
    return `${API_BASE_URL}/api/facebook/file/${encodeURIComponent(fileName)}`;
}
