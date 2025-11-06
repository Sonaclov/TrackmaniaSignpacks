/**
 * Constants and Configuration for Trackmania Signpack Generator
 * All magic numbers and hardcoded values centralized here
 */

export const SIGN_FORMATS = {
    '6x1': { width: 512, height: 80, name: 'Panoramic (6x1)', ratio: '6:1' },
    '1x1': { width: 1024, height: 1024, name: 'Square (1x1)', ratio: '1:1' },
    '2x1': { width: 1024, height: 512, name: 'Wide (2x1)', ratio: '2:1' },
    '4x1': { width: 1024, height: 256, name: 'Banner (4x1)', ratio: '4:1' }
};

export const LIMITS = {
    // Font settings
    MIN_FONT_SIZE: 20,
    MAX_FONT_SIZE: 120,
    MIN_LETTER_SPACING: -5,
    MAX_LETTER_SPACING: 15,
    MIN_TEXT_SKEW: -30,
    MAX_TEXT_SKEW: 30,

    // Checkpoint numbering
    MIN_CHECKPOINT: 1,
    MAX_CHECKPOINT: 999,
    MAX_BULK_GENERATION: 200,
    WARNING_BULK_THRESHOLD: 200,

    // File upload
    MAX_IMAGE_SIZE_MB: 10,
    MAX_IMAGE_DIMENSION: 4096,
    ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],

    // Performance
    GENERATION_BATCH_SIZE: 5,
    DELAY_PER_BATCH_MS: 10,
    DEBOUNCE_DELAY_MS: 150,
    FONT_LOAD_TIMEOUT_MS: 1000,

    // Storage
    LOCALSTORAGE_QUOTA_WARNING_MB: 4,
    MAX_PRESETS: 50,

    // Effects
    MIN_SHADOW_BLUR: 0,
    MAX_SHADOW_BLUR: 20,
    MIN_SHADOW_OFFSET: -20,
    MAX_SHADOW_OFFSET: 20,
    MIN_STROKE_WIDTH: 0,
    MAX_STROKE_WIDTH: 10,
    MIN_GLOW_INTENSITY: 0,
    MAX_GLOW_INTENSITY: 30,
    MIN_BORDER_WIDTH: 0,
    MAX_BORDER_WIDTH: 20,
    MIN_CORNER_RADIUS: 0,
    MAX_CORNER_RADIUS: 50,
    MIN_EFFECT_INTENSITY: 0,
    MAX_EFFECT_INTENSITY: 10,

    // Background
    MIN_GRADIENT_ANGLE: 0,
    MAX_GRADIENT_ANGLE: 360,
    MIN_PATTERN_SIZE: 5,
    MAX_PATTERN_SIZE: 100,
    MIN_NOISE_INTENSITY: 0,
    MAX_NOISE_INTENSITY: 100,
    MIN_NOISE_SCALE: 0.1,
    MAX_NOISE_SCALE: 5,
    MIN_IMAGE_OPACITY: 0,
    MAX_IMAGE_OPACITY: 100
};

export const FONT_FAMILIES = [
    // Core fonts
    'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Lato',
    // Display fonts
    'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', 'Bungee', 'Impact', 'Anton', 'Oswald',
    // Gaming fonts
    'Press Start 2P', 'Black Ops One', 'Russo One', 'Racing Sans One', 'Staatliches', 'Bebas Neue',
    // Decorative fonts
    'Permanent Marker', 'Creepster', 'Nosifer', 'Monoton', 'Faster One', 'Alfa Slab One',
    'Righteous', 'Bangers', 'Fredoka One', 'Squada One',
    // Script fonts
    'Lobster', 'Pacifico', 'Dancing Script', 'Great Vibes', 'Shadows Into Light', 'Caveat', 'Kalam',
    // Technical fonts
    'JetBrains Mono', 'Fira Code', 'Share Tech Mono', 'Electrolize', 'Michroma', 'Iceland', 'Chakra Petch'
];

export const FONT_WEIGHTS = [
    { value: '100', label: 'Thin' },
    { value: '200', label: 'Extra Light' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' }
];

export const BLEND_MODES = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light',
    'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

export const PATTERN_TYPES = [
    'stripes', 'checkerboard', 'dots', 'waves', 'grid', 'hexagon', 'carbon'
];

export const BORDER_STYLES = [
    'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'
];

export const TEXT_TRANSFORMS = [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' }
];

export const COMPRESSION_SETTINGS = {
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
        level: 6 // 0-9, 6 is good balance of speed/size
    }
};

export const APP_CONFIG = {
    name: 'Trackmania Signpack Generator',
    version: '2.0.0',
    author: 'Community',
    repository: 'https://github.com/Sonaclov/TrackmaniaSignpacks',
    supportUrl: 'https://github.com/Sonaclov/TrackmaniaSignpacks/discussions',
    discordUrl: '', // Add your Discord server URL
    defaultHosting: 'https://dashmap.live'
};

export const ERROR_MESSAGES = {
    JSZIP_NOT_LOADED: 'JSZip library not loaded. Please refresh the page and try again.',
    CANVAS_CONTEXT_FAILED: 'Could not create canvas context. Your browser may not support this feature.',
    INVALID_NUMBER_RANGE: 'Start number cannot be greater than end number.',
    FONT_LOAD_FAILED: 'Some fonts failed to load. The preview may not look correct.',
    FILE_TOO_LARGE: 'Image file is too large. Maximum size is {max}MB.',
    INVALID_FILE_TYPE: 'Invalid file type. Only PNG and JPEG images are allowed.',
    IMAGE_TOO_LARGE: 'Image dimensions are too large. Maximum is {max}px per side.',
    LOCALSTORAGE_FULL: 'Storage quota exceeded. Please delete some presets to free up space.',
    GENERATION_FAILED: 'Failed to generate signpack: {error}',
    INVALID_PRESET_DATA: 'Invalid preset data. Could not load preset.'
};

export default {
    SIGN_FORMATS,
    LIMITS,
    FONT_FAMILIES,
    FONT_WEIGHTS,
    BLEND_MODES,
    PATTERN_TYPES,
    BORDER_STYLES,
    TEXT_TRANSFORMS,
    COMPRESSION_SETTINGS,
    APP_CONFIG,
    ERROR_MESSAGES
};
