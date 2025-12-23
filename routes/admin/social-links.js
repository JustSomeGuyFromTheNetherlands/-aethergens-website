const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');
const { sanitizeString, validateUrl } = require('../../utils/validation');

const platforms = [
    { value: 'discord', label: 'Discord', icon: 'fab fa-discord' },
    { value: 'twitter', label: 'Twitter', icon: 'fab fa-twitter' },
    { value: 'youtube', label: 'YouTube', icon: 'fab fa-youtube' },
    { value: 'twitch', label: 'Twitch', icon: 'fab fa-twitch' },
    { value: 'instagram', label: 'Instagram', icon: 'fab fa-instagram' },
    { value: 'facebook', label: 'Facebook', icon: 'fab fa-facebook' },
    { value: 'reddit', label: 'Reddit', icon: 'fab fa-reddit' },
    { value: 'tiktok', label: 'TikTok', icon: 'fab fa-tiktok' },
    { value: 'website', label: 'Website', icon: 'fas fa-globe' },
    { value: 'other', label: 'Other', icon: 'fas fa-link' }
];

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const links = await db.fetchAll("SELECT * FROM social_links ORDER BY platform ASC");
        
        res.render('admin/social-links', {
            pageName: 'social-links',
            pageTitle: 'Social Links',
            pageSubtitle: 'Manage social media and external links',
            links,
            platforms,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Social links page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const currentAdmin = getCurrentAdmin(req);
        const { action, platform, url, active, link_id } = req.body;
        
        if (action === 'add' || action === 'update') {
            const platformTrimmed = sanitizeString(platform);
            // Don't sanitize URLs - just trim whitespace, validation will handle security
            const urlTrimmed = String(url || '').trim();
            
            if (!platformTrimmed || !platforms.find(p => p.value === platformTrimmed)) {
                return res.redirect('/admin/social-links?error=Invalid platform');
            }
            
            if (!urlTrimmed || !validateUrl(urlTrimmed)) {
                return res.redirect('/admin/social-links?error=Invalid URL format');
            }
            
            // Additional check: ensure URL length is reasonable
            if (urlTrimmed.length > 500) {
                return res.redirect('/admin/social-links?error=URL too long (max 500 characters)');
            }
            
            const isActive = active === 'on' || active === '1' || active === true;
            
            if (action === 'add') {
                await db.insert('social_links', {
                    platform: platformTrimmed,
                    url: urlTrimmed,
                    active: isActive ? 1 : 0
                });
                
                await db.insert('admin_log', {
                    admin: currentAdmin,
                    action: `Added social link: ${platformTrimmed}`,
                    target_type: 'social_link',
                    ip: req.ip
                });
                
                return res.redirect('/admin/social-links?message=added');
            } else {
                await db.update('social_links', {
                    platform: platformTrimmed,
                    url: urlTrimmed,
                    active: isActive ? 1 : 0
                }, 'id = ?', [parseInt(link_id)]);
                
                await db.insert('admin_log', {
                    admin: currentAdmin,
                    action: `Updated social link: ${platformTrimmed}`,
                    target_type: 'social_link',
                    target_id: parseInt(link_id),
                    ip: req.ip
                });
                
                return res.redirect('/admin/social-links?message=updated');
            }
        } else if (action === 'delete') {
            const link = await db.fetchOne("SELECT * FROM social_links WHERE id = ?", [parseInt(link_id)]);
            
            if (link) {
                await db.query("DELETE FROM social_links WHERE id = ?", [parseInt(link_id)]);
                
                await db.insert('admin_log', {
                    admin: currentAdmin,
                    action: `Deleted social link: ${link.platform}`,
                    target_type: 'social_link',
                    ip: req.ip
                });
            }
            
            return res.redirect('/admin/social-links?message=deleted');
        }
        
        res.redirect('/admin/social-links');
    } catch (error) {
        console.error('Social links action error:', error);
        res.redirect('/admin/social-links?error=' + encodeURIComponent(error.message));
    }
});

module.exports = { router, platforms };

