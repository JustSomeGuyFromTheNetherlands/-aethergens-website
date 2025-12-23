/**
 * Input Validation Functions
 * Centralized validation and sanitization
 */

/**
 * Validate email address
 */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate URL
 * Supports standard URLs and Discord invite links
 */
function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }
    
    const trimmed = url.trim();
    
    // Allow Discord invite links (discord.gg, discord.com/invite, discord.com/channels)
    if (/^https?:\/\/(discord\.(gg|com|io)|discordapp\.com)/i.test(trimmed)) {
        try {
            new URL(trimmed);
            return true;
        } catch {
            // Even if URL constructor fails, allow Discord links as they might have special formats
            return /^https?:\/\/(discord\.(gg|com|io)|discordapp\.com)\/.+/i.test(trimmed);
        }
    }
    
    // Standard URL validation
    try {
        const urlObj = new URL(trimmed);
        // Ensure it's http or https
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
}

/**
 * Sanitize string input
 */
function sanitizeString(input, maxLength = null) {
    let sanitized = input.trim().replace(/<[^>]*>/g, '');
    if (maxLength !== null && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized;
}

/**
 * Sanitize HTML (allows safe HTML tags)
 */
function sanitizeHtml(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Validate file upload
 */
function validateFileUpload(file, allowedTypes = [], maxSize = 10485760) {
    const errors = [];
    
    if (!file || file.size === 0) {
        errors.push('File upload error');
        return { valid: false, errors };
    }
    
    if (file.size > maxSize) {
        errors.push(`File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate username (alphanumeric + underscore, 3-16 chars)
 */
function validateUsername(username) {
    return /^[a-zA-Z0-9_]{3,16}$/.test(username);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate integer
 */
function validateInt(value, min = null, max = null) {
    if (!/^-?\d+$/.test(String(value))) {
        return false;
    }
    
    const intValue = parseInt(value, 10);
    
    if (min !== null && intValue < min) {
        return false;
    }
    
    if (max !== null && intValue > max) {
        return false;
    }
    
    return true;
}

/**
 * Validate float
 */
function validateFloat(value, min = null, max = null) {
    if (isNaN(value)) {
        return false;
    }
    
    const floatValue = parseFloat(value);
    
    if (min !== null && floatValue < min) {
        return false;
    }
    
    if (max !== null && floatValue > max) {
        return false;
    }
    
    return true;
}

module.exports = {
    validateEmail,
    validateUrl,
    sanitizeString,
    sanitizeHtml,
    validateFileUpload,
    validateUsername,
    validatePasswordStrength,
    validateInt,
    validateFloat
};

