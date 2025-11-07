/**
 * Icon Library for Trackmania Signpack Generator
 * SVG-based icons that can be rendered on canvas
 */

const IconLibrary = {
    // Arrow Icons (Material Design Style)
    arrows: {
        'double-arrow-up': {
            name: 'Double Arrow Up',
            path: 'M6 17.59L7.41 19 12 14.42 16.59 19 18 17.59l-6-6z M6 11l1.41 1.41L12 7.83l4.59 4.58L18 11l-6-6z',
            viewBox: '0 0 24 24'
        },
        'double-arrow-down': {
            name: 'Double Arrow Down',
            path: 'M18 6.41L16.59 5 12 9.58 7.41 5 6 6.41l6 6z M18 13l-1.41-1.41L12 16.17l-4.59-4.58L6 13l6 6z',
            viewBox: '0 0 24 24'
        },
        'double-arrow-left': {
            name: 'Double Arrow Left',
            path: 'M17.59 18L19 16.59 14.42 12 19 7.41 17.59 6l-6 6z M11 18l1.41-1.41L7.83 12l4.58-4.59L11 6l-6 6z',
            viewBox: '0 0 24 24'
        },
        'double-arrow-right': {
            name: 'Double Arrow Right',
            path: 'M6.41 6L5 7.41 9.58 12 5 16.59 6.41 18l6-6z M13 6l-1.41 1.41L16.17 12l-4.58 4.59L13 18l6-6z',
            viewBox: '0 0 24 24'
        },
        'arrow-up': {
            name: 'Arrow Up',
            path: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
            viewBox: '0 0 24 24'
        },
        'arrow-down': {
            name: 'Arrow Down',
            path: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
            viewBox: '0 0 24 24'
        },
        'arrow-left': {
            name: 'Arrow Left',
            path: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
            viewBox: '0 0 24 24'
        },
        'arrow-right': {
            name: 'Arrow Right',
            path: 'M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z',
            viewBox: '0 0 24 24'
        },
        'arrow-up-left': {
            name: 'Arrow Up Left',
            path: 'M19 17.59L17.59 19 7 8.41V15H5V5h10v2H8.41z',
            viewBox: '0 0 24 24'
        },
        'arrow-up-right': {
            name: 'Arrow Up Right',
            path: 'M5 17.59L6.41 19 17 8.41V15h2V5H9v2h6.59z',
            viewBox: '0 0 24 24'
        },
        'arrow-down-left': {
            name: 'Arrow Down Left',
            path: 'M17 6.41L15.59 5 5 15.59V9H3v10h10v-2H6.41z',
            viewBox: '0 0 24 24'
        },
        'arrow-down-right': {
            name: 'Arrow Down Right',
            path: 'M7 6.41L8.41 5 19 15.59V9h2v10H11v-2h6.59z',
            viewBox: '0 0 24 24'
        },
        'fast-forward': {
            name: 'Fast Forward',
            path: 'M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z',
            viewBox: '0 0 24 24'
        },
        'fast-rewind': {
            name: 'Fast Rewind',
            path: 'M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z',
            viewBox: '0 0 24 24'
        }
    },

    // Race Type Icons
    race: {
        'checkered-flag': {
            name: 'Checkered Flag',
            path: 'M4 4h2v2H4V4zm0 4h2v2H4V8zm0 4h2v2H4v-2zm0 4h2v2H4v-2zm0 4h2v2H4v-2zM6 4h2v2H6V4zm0 4h2v2H6V8zm0 4h2v2H6v-2zm0 4h2v2H6v-2zm0 4h2v2H6v-2zM8 4h2v2H8V4zm0 4h2v2H8V8zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm2-12h2v2h-2V4zm0 4h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-12h2v2h-2V4zm0 4h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-12h2v2h-2V4zm0 4h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-12h2v2h-2V4zm0 4h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zM4 2v20h2V2H4z',
            viewBox: '0 0 24 24'
        },
        'timer': {
            name: 'Timer',
            path: 'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
            viewBox: '0 0 24 24'
        },
        'speed': {
            name: 'Speed',
            path: 'M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z',
            viewBox: '0 0 24 24'
        },
        'finish': {
            name: 'Finish Line',
            path: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z',
            viewBox: '0 0 24 24'
        },
        'trophy': {
            name: 'Trophy',
            path: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm7 6c-1.65 0-3-1.35-3-3V5h6v6c0 1.65-1.35 3-3 3zm7-6c0 1.3-.84 2.4-2 2.82V7h2v1z',
            viewBox: '0 0 24 24'
        },
        'star': {
            name: 'Star',
            path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
            viewBox: '0 0 24 24'
        },
        'bolt': {
            name: 'Lightning Bolt',
            path: 'M7 2v11h3v9l7-12h-4l4-8z',
            viewBox: '0 0 24 24'
        },
        'target': {
            name: 'Target',
            path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
            viewBox: '0 0 24 24'
        },
        'rocket': {
            name: 'Rocket',
            path: 'M9 0C5 3.5 4 8 4 9v2c0 1 1 2 2 2h1l1 2h2l1-2h1c1 0 2-1 2-2V9c0-1-1-5.5-5-9zm0 11c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM2 22h14v-2H2v2z M7 18c0-1.1.9-2 2-2s2 .9 2 2h1c0-1.1.9-2 2-2s2 .9 2 2h2v-4H5v4h2z',
            viewBox: '0 0 18 24'
        },
        'medal': {
            name: 'Medal',
            path: 'M12 8c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zm2 4.5c0 2.49-2.01 4.5-4.5 4.5S5 14.99 5 12.5c0-.35.05-.69.13-1.02L2 7h4L8 2l2 5h4l-3.13 4.48c.08.33.13.67.13 1.02z M20 2h-4l-2 5 2 5h4z M8 2H4l2 5-2 5h4z',
            viewBox: '0 0 24 24'
        }
    },

    /**
     * Render an icon to a canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} category - Icon category ('arrows' or 'race')
     * @param {string} iconId - Icon identifier
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Icon size
     * @param {string} color - Icon color
     */
    renderIcon(ctx, category, iconId, x, y, size, color = '#ffffff') {
        const icon = this[category]?.[iconId];
        if (!icon) {
            console.warn(`Icon not found: ${category}/${iconId}`);
            return;
        }

        const viewBox = icon.viewBox.split(' ').map(Number);
        const vbWidth = viewBox[2] - viewBox[0];
        const vbHeight = viewBox[3] - viewBox[1];
        const scale = size / Math.max(vbWidth, vbHeight);

        ctx.save();
        ctx.translate(x - (vbWidth * scale) / 2, y - (vbHeight * scale) / 2);
        ctx.scale(scale, scale);
        ctx.fillStyle = color;

        // Parse and render the SVG path
        const path = new Path2D(icon.path);
        ctx.fill(path);

        ctx.restore();
    },

    /**
     * Get all icons in a category
     * @param {string} category - Icon category
     * @returns {Array} Array of {id, name} objects
     */
    getIconList(category) {
        if (!this[category]) return [];
        return Object.entries(this[category]).map(([id, icon]) => ({
            id,
            name: icon.name
        }));
    },

    /**
     * Render icon preview as data URL
     * @param {string} category - Icon category
     * @param {string} iconId - Icon identifier
     * @param {number} size - Canvas size
     * @param {string} color - Icon color
     * @returns {string} Data URL
     */
    getIconPreviewDataUrl(category, iconId, size = 48, color = '#ffffff') {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        this.renderIcon(ctx, category, iconId, size / 2, size / 2, size * 0.8, color);

        return canvas.toDataURL();
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IconLibrary;
}
