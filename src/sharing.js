/**
 * Sharing & Community Features for Trackmania Signpack Generator
 * Handles preset sharing, Discord integration, and social features
 */

import { compressSettings, decompressSettings, hexToDecimal, copyToClipboard, showToast } from './utils.js';
import { APP_CONFIG } from './constants.js';

/**
 * Share Manager - handles all sharing functionality
 */
export class ShareManager {
    constructor() {
        this.baseUrl = window.location.origin + window.location.pathname;
    }

    /**
     * Generate shareable URL for current settings
     * @param {Object} settings - Settings to share
     * @returns {string} Shareable URL
     */
    generateShareLink(settings) {
        const compressed = compressSettings(settings);
        if (!compressed) {
            throw new Error('Failed to compress settings');
        }

        const url = new URL(this.baseUrl);
        url.searchParams.set('preset', compressed);
        return url.toString();
    }

    /**
     * Load settings from URL
     * @returns {Object|null} Settings object or null
     */
    loadFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const presetData = urlParams.get('preset');

        if (!presetData) {
            return null;
        }

        const settings = decompressSettings(presetData);
        if (!settings) {
            console.error('Failed to decompress settings from URL');
            return null;
        }

        return settings;
    }

    /**
     * Show share modal with options
     * @param {Object} settings - Current settings
     * @param {HTMLCanvasElement} previewCanvas - Preview canvas for thumbnail
     */
    async showShareModal(settings, previewCanvas = null) {
        const shareUrl = this.generateShareLink(settings);

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🚀 Share Your Design</h2>
                    <button class="modal-close" onclick="this.closest('.share-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="share-preview">
                        ${previewCanvas ? `<canvas id="sharePreviewCanvas"></canvas>` : ''}
                    </div>

                    <div class="share-url-section">
                        <label>Share Link:</label>
                        <div class="url-input-group">
                            <input type="text" id="shareUrlInput" readonly value="${shareUrl}">
                            <button class="copy-btn" onclick="shareManager.copyShareLink('${shareUrl}')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <small>Anyone with this link can load your exact design!</small>
                    </div>

                    <div class="share-options">
                        <h3>Share to:</h3>
                        <div class="share-buttons">
                            <button class="share-btn discord" onclick="shareManager.shareToDiscord('${shareUrl}', ${!!previewCanvas})">
                                <i class="fab fa-discord"></i> Discord
                            </button>
                            <button class="share-btn twitter" onclick="shareManager.shareToTwitter('${shareUrl}')">
                                <i class="fab fa-twitter"></i> Twitter
                            </button>
                            <button class="share-btn reddit" onclick="shareManager.shareToReddit('${shareUrl}')">
                                <i class="fab fa-reddit"></i> Reddit
                            </button>
                            <button class="share-btn generic" onclick="shareManager.shareGeneric('${shareUrl}')">
                                <i class="fas fa-share-alt"></i> More...
                            </button>
                        </div>
                    </div>

                    <div class="share-tips">
                        <h4><i class="fas fa-lightbulb"></i> Sharing Tips</h4>
                        <ul>
                            <li>Share in Trackmania Discord servers and Reddit</li>
                            <li>Include a screenshot or video of your map</li>
                            <li>Describe what makes your design unique</li>
                            <li>Tag it with relevant categories (#neon, #clan, etc.)</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Add styles if not present
        if (!document.getElementById('share-modal-styles')) {
            this.addShareStyles();
        }

        document.body.appendChild(modal);

        // Copy preview canvas if provided
        if (previewCanvas) {
            const sharePreview = document.getElementById('sharePreviewCanvas');
            sharePreview.width = previewCanvas.width;
            sharePreview.height = previewCanvas.height;
            const ctx = sharePreview.getContext('2d');
            ctx.drawImage(previewCanvas, 0, 0);
        }
    }

    /**
     * Copy share link to clipboard
     * @param {string} url - URL to copy
     */
    async copyShareLink(url) {
        const success = await copyToClipboard(url);
        if (success) {
            showToast('✅ Link copied to clipboard!', 'success');
        } else {
            showToast('❌ Failed to copy link', 'error');
        }
    }

    /**
     * Share to Discord
     * @param {string} shareUrl - Share URL
     * @param {boolean} hasPreview - Whether preview image is available
     */
    async shareToDiscord(shareUrl, hasPreview = false) {
        // Check if Discord webhook is saved
        const savedWebhook = localStorage.getItem('discord_webhook');

        if (savedWebhook) {
            const useWebhook = confirm('Share directly to your Discord server using saved webhook?');
            if (useWebhook) {
                await this.postToDiscordWebhook(savedWebhook, shareUrl, hasPreview);
                return;
            }
        }

        // Otherwise, copy message for manual sharing
        const message = `Check out my custom Trackmania checkpoint design! 🏁\n\n${shareUrl}\n\nMade with Trackmania Signpack Generator`;
        const success = await copyToClipboard(message);

        if (success) {
            showToast('✅ Discord message copied! Paste it in any channel.', 'success', 4000);
        }
    }

    /**
     * Post to Discord webhook
     * @param {string} webhookUrl - Discord webhook URL
     * @param {string} shareUrl - Share URL
     * @param {boolean} hasPreview - Whether to include preview
     */
    async postToDiscordWebhook(webhookUrl, shareUrl, hasPreview) {
        try {
            const embed = {
                title: "🏁 Custom Checkpoint Design",
                description: "Check out my custom checkpoint signpack!",
                color: hexToDecimal('#4facfe'),
                fields: [
                    {
                        name: "🔗 Try it yourself",
                        value: `[Click here to load this design](${shareUrl})`
                    }
                ],
                footer: {
                    text: "Made with Trackmania Signpack Generator"
                },
                timestamp: new Date().toISOString()
            };

            // If preview available, attach image
            let formData = null;
            if (hasPreview) {
                const previewCanvas = document.getElementById('sharePreviewCanvas');
                if (previewCanvas) {
                    const blob = await new Promise(resolve => previewCanvas.toBlob(resolve, 'image/png'));
                    formData = new FormData();
                    formData.append('file', blob, 'preview.png');
                    embed.image = { url: 'attachment://preview.png' };
                }
            }

            const payload = { embeds: [embed] };

            if (formData) {
                formData.append('payload_json', JSON.stringify(payload));
                await fetch(webhookUrl, {
                    method: 'POST',
                    body: formData
                });
            } else {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            showToast('✅ Posted to Discord!', 'success');
        } catch (error) {
            console.error('Discord webhook failed:', error);
            showToast('❌ Failed to post to Discord', 'error');
        }
    }

    /**
     * Configure Discord webhook
     */
    configureDiscordWebhook() {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fab fa-discord"></i> Discord Integration</h2>
                    <button class="modal-close" onclick="this.closest('.share-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Share your designs directly to Discord!</p>

                    <div class="discord-setup">
                        <h3>Setup Instructions:</h3>
                        <ol>
                            <li>Go to your Discord server settings</li>
                            <li>Navigate to Integrations → Webhooks</li>
                            <li>Create a new webhook</li>
                            <li>Copy the webhook URL</li>
                            <li>Paste it below</li>
                        </ol>

                        <div class="form-group">
                            <label>Discord Webhook URL:</label>
                            <input type="url" id="webhookUrlInput"
                                   placeholder="https://discord.com/api/webhooks/...">
                            <small>Your webhook URL is stored locally and never sent to our servers</small>
                        </div>

                        <div class="modal-actions">
                            <button class="btn-primary" onclick="shareManager.saveDiscordWebhook()">
                                <i class="fas fa-save"></i> Save Webhook
                            </button>
                            <button class="btn-secondary" onclick="shareManager.clearDiscordWebhook()">
                                <i class="fas fa-trash"></i> Clear Saved Webhook
                            </button>
                        </div>

                        <a href="https://support.discord.com/hc/en-us/articles/228383668"
                           target="_blank" class="help-link">
                            <i class="fas fa-question-circle"></i> How to create a webhook
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Save Discord webhook
     */
    saveDiscordWebhook() {
        const input = document.getElementById('webhookUrlInput');
        const url = input.value.trim();

        if (!url) {
            showToast('❌ Please enter a webhook URL', 'error');
            return;
        }

        // Validate Discord webhook URL format
        if (!url.startsWith('https://discord.com/api/webhooks/')) {
            showToast('❌ Invalid Discord webhook URL', 'error');
            return;
        }

        localStorage.setItem('discord_webhook', url);
        showToast('✅ Discord webhook saved!', 'success');

        // Close modal
        document.querySelector('.share-modal')?.remove();
    }

    /**
     * Clear saved Discord webhook
     */
    clearDiscordWebhook() {
        localStorage.removeItem('discord_webhook');
        showToast('🗑️ Discord webhook cleared', 'info');
        document.querySelector('.share-modal')?.remove();
    }

    /**
     * Share to Twitter
     * @param {string} shareUrl - Share URL
     */
    shareToTwitter(shareUrl) {
        const text = encodeURIComponent(`Check out my custom Trackmania checkpoint design! 🏁\n\n#Trackmania #Gaming`);
        const url = encodeURIComponent(shareUrl);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    }

    /**
     * Share to Reddit
     * @param {string} shareUrl - Share URL
     */
    shareToReddit(shareUrl) {
        const title = encodeURIComponent('Custom Trackmania Checkpoint Design');
        const url = encodeURIComponent(shareUrl);
        const redditUrl = `https://reddit.com/submit?title=${title}&url=${url}`;
        window.open(redditUrl, '_blank');
    }

    /**
     * Generic share (Web Share API or fallback)
     * @param {string} shareUrl - Share URL
     */
    async shareGeneric(shareUrl) {
        const shareData = {
            title: 'Trackmania Checkpoint Design',
            text: 'Check out my custom checkpoint design!',
            url: shareUrl
        };

        // Try Web Share API (mobile)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showToast('✅ Shared successfully!', 'success');
                return;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        }

        // Fallback: copy to clipboard
        const success = await copyToClipboard(shareUrl);
        if (success) {
            showToast('✅ Link copied to clipboard!', 'success');
        }
    }

    /**
     * Add share modal styles
     */
    addShareStyles() {
        const style = document.createElement('style');
        style.id = 'share-modal-styles';
        style.textContent = `
            .share-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .share-modal .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }

            .share-modal .modal-content {
                position: relative;
                background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                animation: modalSlideIn 0.3s ease-out;
            }

            @keyframes modalSlideIn {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .share-modal .modal-header {
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .share-modal .modal-header h2 {
                margin: 0;
                color: #fff;
                font-size: 1.5em;
            }

            .share-modal .modal-close {
                background: transparent;
                border: none;
                color: #fff;
                font-size: 1.5em;
                cursor: pointer;
                padding: 5px 10px;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .share-modal .modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .share-modal .modal-body {
                padding: 20px;
            }

            .share-preview {
                text-align: center;
                margin-bottom: 20px;
            }

            .share-preview canvas {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .share-url-section {
                margin-bottom: 25px;
            }

            .share-url-section label {
                display: block;
                color: #aaa;
                margin-bottom: 8px;
                font-size: 0.9em;
            }

            .url-input-group {
                display: flex;
                gap: 8px;
            }

            .url-input-group input {
                flex: 1;
                padding: 10px 12px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: #fff;
                font-family: monospace;
                font-size: 0.9em;
            }

            .url-input-group .copy-btn {
                padding: 10px 16px;
                background: #4facfe;
                border: none;
                border-radius: 6px;
                color: #fff;
                cursor: pointer;
                font-weight: 600;
                transition: background 0.2s;
            }

            .url-input-group .copy-btn:hover {
                background: #3d8fd1;
            }

            .share-url-section small {
                display: block;
                color: #888;
                margin-top: 8px;
                font-size: 0.85em;
            }

            .share-options h3 {
                color: #fff;
                margin-bottom: 12px;
                font-size: 1.1em;
            }

            .share-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
                margin-bottom: 20px;
            }

            .share-btn {
                padding: 12px 16px;
                border: none;
                border-radius: 8px;
                color: #fff;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .share-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .share-btn.discord {
                background: #5865F2;
            }

            .share-btn.twitter {
                background: #1DA1F2;
            }

            .share-btn.reddit {
                background: #FF4500;
            }

            .share-btn.generic {
                background: #666;
            }

            .share-tips {
                background: rgba(79, 172, 254, 0.1);
                border-left: 3px solid #4facfe;
                padding: 15px;
                border-radius: 6px;
            }

            .share-tips h4 {
                color: #4facfe;
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 1em;
            }

            .share-tips ul {
                margin: 0;
                padding-left: 20px;
                color: #ccc;
                font-size: 0.9em;
            }

            .share-tips li {
                margin-bottom: 6px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Global instance
export const shareManager = new ShareManager();

// Make available globally for onclick handlers
window.shareManager = shareManager;

export default { ShareManager, shareManager };
