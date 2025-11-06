/**
 * Utility Functions for Trackmania Signpack Generator
 * Reusable helper functions for common operations
 */

/**
 * Debounce function - limits how often a function can fire
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - ensures function fires at most once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between calls
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Compress settings object to base64 for URL sharing
 * @param {Object} settings - Settings object to compress
 * @returns {string} Base64 encoded compressed string
 */
export function compressSettings(settings) {
    try {
        const json = JSON.stringify(settings);
        // Use simple base64 encoding (could use LZString for better compression)
        return btoa(encodeURIComponent(json));
    } catch (error) {
        console.error('Failed to compress settings:', error);
        return null;
    }
}

/**
 * Decompress base64 settings to object
 * @param {string} compressed - Compressed base64 string
 * @returns {Object|null} Settings object or null if invalid
 */
export function decompressSettings(compressed) {
    try {
        const json = decodeURIComponent(atob(compressed));
        return JSON.parse(json);
    } catch (error) {
        console.error('Failed to decompress settings:', error);
        return null;
    }
}

/**
 * Convert hex color to decimal (for Discord embeds)
 * @param {string} hex - Hex color string (#RRGGBB)
 * @returns {number} Decimal color value
 */
export function hexToDecimal(hex) {
    return parseInt(hex.replace('#', ''), 16);
}

/**
 * Convert decimal color to hex
 * @param {number} decimal - Decimal color value
 * @returns {string} Hex color string
 */
export function decimalToHex(decimal) {
    return '#' + decimal.toString(16).padStart(6, '0');
}

/**
 * Sanitize filename - remove invalid characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string (e.g., "2.5 MB")
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Generate a random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Seeded random number generator
 * @param {string} seed - Seed string
 * @returns {Function} RNG function that returns 0-1
 */
export function seededRandom(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash;
    }

    return function() {
        hash = (hash * 9301 + 49297) % 233280;
        return hash / 233280;
    };
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Check if browser supports certain features
 * @returns {Object} Feature support flags
 */
export function checkFeatureSupport() {
    return {
        canvas: !!document.createElement('canvas').getContext,
        localStorage: !!window.localStorage,
        fontLoading: 'fonts' in document,
        clipboard: !!navigator.clipboard,
        webWorkers: !!window.Worker,
        offscreenCanvas: !!window.OffscreenCanvas
    };
}

/**
 * Get distance between two touch points
 * @param {Touch} touch1 - First touch point
 * @param {Touch} touch2 - Second touch point
 * @returns {number} Distance in pixels
 */
export function getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Parse URL parameters
 * @returns {Object} URL parameters as key-value pairs
 */
export function getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
        params[key] = value;
    }
    return params;
}

/**
 * Update URL without reloading page
 * @param {Object} params - Parameters to add to URL
 */
export function updateUrl(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.replaceState({}, '', url);
}

/**
 * Estimate file size of generated signpack
 * @param {number} signCount - Number of signs
 * @param {Object} dimensions - Sign dimensions
 * @returns {string} Estimated size string
 */
export function estimateSignpackSize(signCount, dimensions) {
    // Rough estimate: PNG size depends on complexity
    // Simple sign: ~10KB, Complex: ~50KB
    // Use 25KB average
    const avgSizePerSign = 25 * 1024;
    const totalBytes = signCount * avgSizePerSign;
    return formatBytes(totalBytes);
}

/**
 * Estimate generation time
 * @param {number} signCount - Number of signs
 * @returns {string} Estimated time string
 */
export function estimateGenerationTime(signCount) {
    // Rough estimate: ~300ms per sign including delays
    const msPerSign = 300;
    const totalSeconds = Math.ceil((signCount * msPerSign) / 1000);

    if (totalSeconds < 60) {
        return `~${totalSeconds}s`;
    } else {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `~${minutes}m ${seconds}s`;
    }
}

/**
 * Create a download link and trigger download
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Download filename
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Show a toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in ms
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Check if toast container exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };

    toast.style.cssText = `
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        border-left: 4px solid ${colors[type]};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    toast.innerHTML = `
        <span style="font-size: 1.2em;">${icons[type]}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            container.removeChild(toast);
            if (container.children.length === 0) {
                document.body.removeChild(container);
            }
        }, 300);
    }, duration);
}

// Add animation styles if not already present
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

export default {
    debounce,
    throttle,
    sleep,
    compressSettings,
    decompressSettings,
    hexToDecimal,
    decimalToHex,
    sanitizeFilename,
    formatBytes,
    copyToClipboard,
    generateId,
    seededRandom,
    isMobile,
    checkFeatureSupport,
    getTouchDistance,
    getUrlParams,
    updateUrl,
    estimateSignpackSize,
    estimateGenerationTime,
    downloadBlob,
    showToast
};
