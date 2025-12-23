const { getDB } = require('../database');
const { getCurrentAdmin } = require('./auth');
const adminConfig = require('./adminConfig');

// Get notification counts
async function getNotificationCounts() {
    try {
        const db = getDB();
        const appeals = await db.fetchOne("SELECT COUNT(*) as count FROM appeals WHERE status = 'pending'");
        const applications = await db.fetchOne("SELECT COUNT(*) as count FROM applications_pending WHERE status = 'pending'");
        
        return {
            appeals: appeals?.count || 0,
            applications: applications?.count || 0
        };
    } catch (error) {
        return { appeals: 0, applications: 0 };
    }
}

// Admin layout middleware - injects common data for admin pages
async function adminLayout(req, res, next) {
    try {
        const currentAdmin = getCurrentAdmin(req);
        const notificationCounts = await getNotificationCounts();
        const totalNotifications = notificationCounts.appeals + notificationCounts.applications;
        const adminColors = await adminConfig.loadAdminColors();
        
        // Navigation items
        const navItems = {
            'index': { icon: 'fas fa-home', label: 'Dashboard', badge: null },
            'players': { icon: 'fas fa-users', label: 'Players', badge: null },
            'bans': { icon: 'fas fa-ban', label: 'Bans', badge: null },
            'appeals': { icon: 'fas fa-gavel', label: 'Appeals', badge: notificationCounts.appeals > 0 ? notificationCounts.appeals : null },
            'applications': { icon: 'fas fa-file-alt', label: 'Applications', badge: notificationCounts.applications > 0 ? notificationCounts.applications : null },
            'news': { icon: 'fas fa-newspaper', label: 'News', badge: null },
            'features': { icon: 'fas fa-star', label: 'Features', badge: null },
            'rules': { icon: 'fas fa-gavel', label: 'Rules', badge: null },
            'store': { icon: 'fas fa-store', label: 'Store', badge: null },
            'users': { icon: 'fas fa-user-shield', label: 'Users', badge: null },
            'analytics': { icon: 'fas fa-chart-bar', label: 'Analytics', badge: null },
            'logs': { icon: 'fas fa-history', label: 'Activity Logs', badge: null },
            'social-links': { icon: 'fas fa-share-alt', label: 'Social Links', badge: null },
            'wall-of-fame': { icon: 'fas fa-trophy', label: 'Wall of Fame', badge: null },
            'backups': { icon: 'fas fa-database', label: 'Backups', badge: null },
            'files': { icon: 'fas fa-folder', label: 'Files', badge: null },
            'api-key': { icon: 'fas fa-key', label: 'API Key', badge: null },
            'webhooks': { icon: 'fab fa-discord', label: 'Webhooks', badge: null },
            'notifications': { icon: 'fas fa-bell', label: 'Notifications', badge: null },
            'console': { icon: 'fas fa-terminal', label: 'Console', badge: null },
            'settings': { icon: 'fas fa-cog', label: 'Settings', badge: null }
        };
        
        // Compute CSS and styling values
        const colorsCSS = adminConfig.getAdminColorsCSS(adminColors);
        const gradient = adminConfig.getAdminGradient(adminColors);
        const primaryRgba = adminConfig.hexToRgba(adminColors.primary, 0.1);
        const secondaryRgba = adminConfig.hexToRgba(adminColors.secondary, 0.1);
        const primaryRgbaShadow = adminConfig.hexToRgba(adminColors.primary, 0.3);
        
        // Determine current page from route
        const pathParts = req.path.split('/').filter(p => p);
        const pageName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'index';
        
        // Make data available to views
        res.locals.currentAdmin = currentAdmin;
        res.locals.notificationCounts = notificationCounts;
        res.locals.totalNotifications = totalNotifications;
        res.locals.navItems = navItems;
        res.locals.adminColors = adminColors;
        res.locals.colorsCSS = colorsCSS;
        res.locals.gradient = gradient;
        res.locals.primaryRgba = primaryRgba;
        res.locals.secondaryRgba = secondaryRgba;
        res.locals.primaryRgbaShadow = primaryRgbaShadow;
        res.locals.ADMIN_BRAND_NAME = adminConfig.ADMIN_BRAND_NAME;
        res.locals.ADMIN_BRAND_ICON = adminConfig.ADMIN_BRAND_ICON;
        res.locals.pageName = pageName;
        
        next();
    } catch (error) {
        console.error('Admin layout error:', error);
        next(error);
    }
}

module.exports = { adminLayout, getNotificationCounts };

