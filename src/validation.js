/**
 * Validation System for Trackmania Signpack Generator
 * Validates all user inputs and provides helpful error messages
 */

import { LIMITS, ERROR_MESSAGES } from './constants.js';

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

/**
 * Input Validator - validates all user inputs
 */
export class InputValidator {
    /**
     * Validate integer input
     * @param {*} value - Value to validate
     * @param {Object} options - Validation options
     * @returns {number} Validated integer
     * @throws {ValidationError} If validation fails
     */
    static validateInteger(value, options = {}) {
        const {
            min = -Infinity,
            max = Infinity,
            defaultValue = null,
            fieldName = 'Value'
        } = options;

        // Handle null/undefined
        if (value === null || value === undefined || value === '') {
            if (defaultValue !== null) {
                return defaultValue;
            }
            throw new ValidationError(`${fieldName} is required`, fieldName);
        }

        // Parse to number
        const num = parseInt(value, 10);

        // Check if valid number
        if (isNaN(num)) {
            throw new ValidationError(
                `${fieldName} must be a valid number`,
                fieldName
            );
        }

        // Check range
        if (num < min) {
            throw new ValidationError(
                `${fieldName} must be at least ${min}`,
                fieldName
            );
        }

        if (num > max) {
            throw new ValidationError(
                `${fieldName} must be at most ${max}`,
                fieldName
            );
        }

        return num;
    }

    /**
     * Validate float input
     * @param {*} value - Value to validate
     * @param {Object} options - Validation options
     * @returns {number} Validated float
     * @throws {ValidationError} If validation fails
     */
    static validateFloat(value, options = {}) {
        const {
            min = -Infinity,
            max = Infinity,
            defaultValue = null,
            fieldName = 'Value'
        } = options;

        if (value === null || value === undefined || value === '') {
            if (defaultValue !== null) {
                return defaultValue;
            }
            throw new ValidationError(`${fieldName} is required`, fieldName);
        }

        const num = parseFloat(value);

        if (isNaN(num)) {
            throw new ValidationError(
                `${fieldName} must be a valid number`,
                fieldName
            );
        }

        if (num < min || num > max) {
            throw new ValidationError(
                `${fieldName} must be between ${min} and ${max}`,
                fieldName
            );
        }

        return num;
    }

    /**
     * Validate string input
     * @param {*} value - Value to validate
     * @param {Object} options - Validation options
     * @returns {string} Validated string
     * @throws {ValidationError} If validation fails
     */
    static validateString(value, options = {}) {
        const {
            minLength = 0,
            maxLength = Infinity,
            defaultValue = null,
            fieldName = 'Value',
            allowEmpty = true
        } = options;

        if (value === null || value === undefined) {
            if (defaultValue !== null) {
                return defaultValue;
            }
            throw new ValidationError(`${fieldName} is required`, fieldName);
        }

        const str = String(value);

        if (!allowEmpty && str.trim().length === 0) {
            throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
        }

        if (str.length < minLength) {
            throw new ValidationError(
                `${fieldName} must be at least ${minLength} characters`,
                fieldName
            );
        }

        if (str.length > maxLength) {
            throw new ValidationError(
                `${fieldName} must be at most ${maxLength} characters`,
                fieldName
            );
        }

        return str;
    }

    /**
     * Validate hex color
     * @param {string} value - Color value
     * @param {string} fieldName - Field name for error messages
     * @returns {string} Validated hex color
     * @throws {ValidationError} If validation fails
     */
    static validateColor(value, fieldName = 'Color') {
        if (!value) {
            throw new ValidationError(`${fieldName} is required`, fieldName);
        }

        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(value)) {
            throw new ValidationError(
                `${fieldName} must be a valid hex color (e.g., #FF0000)`,
                fieldName
            );
        }

        return value;
    }

    /**
     * Validate checkpoint range
     * @param {number} start - Start number
     * @param {number} end - End number
     * @throws {ValidationError} If validation fails
     */
    static validateCheckpointRange(start, end) {
        const startNum = this.validateInteger(start, {
            min: LIMITS.MIN_CHECKPOINT,
            max: LIMITS.MAX_CHECKPOINT,
            fieldName: 'Start number'
        });

        const endNum = this.validateInteger(end, {
            min: LIMITS.MIN_CHECKPOINT,
            max: LIMITS.MAX_CHECKPOINT,
            fieldName: 'End number'
        });

        if (startNum > endNum) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_NUMBER_RANGE);
        }

        const totalSigns = endNum - startNum + 1;
        if (totalSigns > LIMITS.MAX_BULK_GENERATION) {
            throw new ValidationError(
                `Cannot generate more than ${LIMITS.MAX_BULK_GENERATION} signs at once. Current range: ${totalSigns} signs.`
            );
        }

        return { startNum, endNum, totalSigns };
    }

    /**
     * Validate file upload
     * @param {File} file - File to validate
     * @returns {boolean} True if valid
     * @throws {ValidationError} If validation fails
     */
    static validateImageFile(file) {
        if (!file) {
            throw new ValidationError('No file selected');
        }

        // Check file type
        if (!LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new ValidationError(
                ERROR_MESSAGES.INVALID_FILE_TYPE
            );
        }

        // Check file size
        const maxBytes = LIMITS.MAX_IMAGE_SIZE_MB * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new ValidationError(
                ERROR_MESSAGES.FILE_TOO_LARGE.replace('{max}', LIMITS.MAX_IMAGE_SIZE_MB)
            );
        }

        return true;
    }

    /**
     * Validate image dimensions
     * @param {HTMLImageElement} img - Image element
     * @throws {ValidationError} If validation fails
     */
    static validateImageDimensions(img) {
        if (img.width > LIMITS.MAX_IMAGE_DIMENSION || img.height > LIMITS.MAX_IMAGE_DIMENSION) {
            throw new ValidationError(
                ERROR_MESSAGES.IMAGE_TOO_LARGE.replace('{max}', LIMITS.MAX_IMAGE_DIMENSION)
            );
        }
        return true;
    }

    /**
     * Validate settings object
     * @param {Object} settings - Settings to validate
     * @returns {Object} Validated settings
     * @throws {ValidationError} If validation fails
     */
    static validateSettings(settings) {
        if (!settings || typeof settings !== 'object') {
            throw new ValidationError('Invalid settings object');
        }

        // Validate font size
        if (settings.fontSize !== undefined) {
            settings.fontSize = this.validateInteger(settings.fontSize, {
                min: LIMITS.MIN_FONT_SIZE,
                max: LIMITS.MAX_FONT_SIZE,
                fieldName: 'Font size'
            });
        }

        // Validate letter spacing
        if (settings.letterSpacing !== undefined) {
            settings.letterSpacing = this.validateInteger(settings.letterSpacing, {
                min: LIMITS.MIN_LETTER_SPACING,
                max: LIMITS.MAX_LETTER_SPACING,
                fieldName: 'Letter spacing'
            });
        }

        // Validate text skew
        if (settings.textSkew !== undefined) {
            settings.textSkew = this.validateInteger(settings.textSkew, {
                min: LIMITS.MIN_TEXT_SKEW,
                max: LIMITS.MAX_TEXT_SKEW,
                fieldName: 'Text skew'
            });
        }

        // Validate colors
        const colorFields = [
            'textColor', 'backgroundColor', 'shadowColor', 'strokeColor',
            'glowColor', 'borderColor', 'gradientColor1', 'gradientColor2', 'patternColor'
        ];

        colorFields.forEach(field => {
            if (settings[field]) {
                try {
                    settings[field] = this.validateColor(settings[field], field);
                } catch (error) {
                    // Some color fields are optional, don't throw
                    console.warn(`Invalid ${field}:`, error.message);
                }
            }
        });

        return settings;
    }
}

/**
 * File Validator - validates file operations
 */
export class FileValidator {
    /**
     * Check localStorage quota
     * @returns {Object} Storage info
     */
    static checkLocalStorageQuota() {
        if (!window.localStorage) {
            return { available: false };
        }

        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);

            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }

            const totalSizeMB = totalSize / (1024 * 1024);
            const warningThreshold = LIMITS.LOCALSTORAGE_QUOTA_WARNING_MB;

            return {
                available: true,
                usedMB: totalSizeMB,
                nearLimit: totalSizeMB > warningThreshold,
                warningThreshold
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }

    /**
     * Validate preset save
     * @param {string} name - Preset name
     * @param {Object} data - Preset data
     * @throws {ValidationError} If validation fails
     */
    static validatePresetSave(name, data) {
        // Validate name
        InputValidator.validateString(name, {
            minLength: 1,
            maxLength: 50,
            fieldName: 'Preset name',
            allowEmpty: false
        });

        // Check if name has invalid characters
        if (!/^[a-zA-Z0-9\s_-]+$/.test(name)) {
            throw new ValidationError(
                'Preset name can only contain letters, numbers, spaces, hyphens and underscores'
            );
        }

        // Validate data
        if (!data || typeof data !== 'object') {
            throw new ValidationError('Invalid preset data');
        }

        // Check storage quota
        const quota = this.checkLocalStorageQuota();
        if (quota.nearLimit) {
            throw new ValidationError(
                `Storage is nearly full (${quota.usedMB.toFixed(2)}MB used). Consider deleting old presets.`
            );
        }

        return true;
    }

    /**
     * Validate ZIP file name
     * @param {string} name - File name
     * @returns {string} Sanitized file name
     */
    static validateZipFileName(name) {
        if (!name || name.trim() === '') {
            return 'checkpoint_signpack.zip';
        }

        // Remove invalid filename characters
        let sanitized = name.replace(/[<>:"/\\|?*]/g, '_');

        // Ensure .zip extension
        if (!sanitized.toLowerCase().endsWith('.zip')) {
            sanitized += '.zip';
        }

        return sanitized;
    }
}

/**
 * Error Handler - consistent error handling and user feedback
 */
export class ErrorHandler {
    /**
     * Handle error and show appropriate feedback
     * @param {Error} error - Error to handle
     * @param {string} context - Context where error occurred
     * @param {Function} showNotification - Notification function
     */
    static handle(error, context = '', showNotification = null) {
        console.error(`Error in ${context}:`, error);

        let userMessage = error.message;

        // Customize message based on error type
        if (error instanceof ValidationError) {
            userMessage = `❌ ${error.message}`;
        } else if (error.name === 'QuotaExceededError') {
            userMessage = `❌ ${ERROR_MESSAGES.LOCALSTORAGE_FULL}`;
        } else if (context) {
            userMessage = `❌ Error in ${context}: ${error.message}`;
        }

        // Show notification if function provided
        if (showNotification) {
            showNotification(userMessage, 'error');
        } else {
            // Fallback to alert
            alert(userMessage);
        }

        return userMessage;
    }

    /**
     * Wrap async function with error handling
     * @param {Function} fn - Async function to wrap
     * @param {string} context - Context for error messages
     * @param {Function} showNotification - Notification function
     * @returns {Function} Wrapped function
     */
    static wrapAsync(fn, context, showNotification) {
        return async function(...args) {
            try {
                return await fn.apply(this, args);
            } catch (error) {
                ErrorHandler.handle(error, context, showNotification);
                throw error;
            }
        };
    }
}

export default {
    ValidationError,
    InputValidator,
    FileValidator,
    ErrorHandler
};
