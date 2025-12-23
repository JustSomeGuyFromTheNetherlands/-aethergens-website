const { getDB } = require('../database');

// Default colors
const defaultColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
};

// Load colors from database if available
async function loadAdminColors() {
    const colors = { ...defaultColors };
    
    try {
        const db = getDB();
        for (const key of Object.keys(colors)) {
            const result = await db.fetchOne("SELECT value FROM config WHERE `key` = ?", [`admin_${key}_color`]);
            if (result && result.value) {
                colors[key] = result.value;
            }
        }
    } catch (error) {
        // Use defaults if DB fails
    }
    
    return colors;
}

// Get colors as CSS variables
function getAdminColorsCSS(colors) {
    return `
    :root {
        --admin-primary: ${colors.primary};
        --admin-secondary: ${colors.secondary};
        --admin-accent: ${colors.accent};
        --admin-success: ${colors.success};
        --admin-warning: ${colors.warning};
        --admin-danger: ${colors.danger};
        --admin-info: ${colors.info};
    }`;
}

// Get gradient classes
function getAdminGradient(colors) {
    return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
}

// Convert hex to rgba
function hexToRgba(hex, alpha = 1) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Branding
const ADMIN_BRAND_NAME = 'Minecraft CMS';
const ADMIN_BRAND_ICON = 'fas fa-cube';

module.exports = {
    loadAdminColors,
    getAdminColorsCSS,
    getAdminGradient,
    hexToRgba,
    ADMIN_BRAND_NAME,
    ADMIN_BRAND_ICON,
    defaultColors
};

