const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getMailjetConfig } = require('../../utils/mailjet');
const { writeBotDataFile } = require('../../utils/botDataWriter');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const activeSection = req.query.section || 'server';
        
        const settings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1") || {
            server_name: 'Minecraft Server',
            server_ip: 'play.example.com',
            server_port: 25565,
            server_version: '',
            server_type: 'survival',
            max_players: 100,
            motd: '',
            status_message: 'Server Online',
            maintenance_mode: 0
        };
        
        // Get color config with proper defaults
        const colorDefaults = {
            'admin_primary_color': '#667eea',
            'admin_secondary_color': '#764ba2',
            'admin_accent_color': '#f093fb',
            'admin_success_color': '#10b981',
            'admin_warning_color': '#f59e0b',
            'admin_danger_color': '#ef4444',
            'admin_info_color': '#3b82f6'
        };
        const colorConfig = {};
        for (const [key, defaultValue] of Object.entries(colorDefaults)) {
            const result = await db.fetchOne("SELECT value FROM config WHERE `key` = ?", [key]);
            colorConfig[key] = result?.value || defaultValue;
        }
        
        const mailjetConfig = getMailjetConfig();
        
        res.render('admin/settings', {
            pageName: 'settings',
            pageTitle: 'Settings',
            pageSubtitle: 'Configure server and appearance settings',
            activeSection,
            settings,
            colorConfig,
            mailjetConfig,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Settings page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { section } = req.body;
        
        if (section === 'server') {
            await db.query(
                `INSERT INTO server_settings (id, server_name, server_ip, server_port, server_version, server_type, max_players, motd, status_message, maintenance_mode) 
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 server_name = VALUES(server_name),
                 server_ip = VALUES(server_ip),
                 server_port = VALUES(server_port),
                 server_version = VALUES(server_version),
                 server_type = VALUES(server_type),
                 max_players = VALUES(max_players),
                 motd = VALUES(motd),
                 status_message = VALUES(status_message),
                 maintenance_mode = VALUES(maintenance_mode),
                 updated_at = NOW()`,
                [
                    sanitizeString(req.body.server_name),
                    sanitizeString(req.body.server_ip),
                    parseInt(req.body.server_port),
                    sanitizeString(req.body.server_version || ''),
                    sanitizeString(req.body.server_type || 'survival'),
                    parseInt(req.body.max_players),
                    sanitizeString(req.body.motd || ''),
                    sanitizeString(req.body.status_message),
                    req.body.maintenance_mode ? 1 : 0
                ]
            );
            await writeBotDataFile();
            res.redirect('/admin/settings?message=saved&section=server');
        } else if (section === 'colors') {
            // Validate hex color format
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            
            const colors = {
                'admin_primary_color': String(req.body.primary_color || '#667eea').trim(),
                'admin_secondary_color': String(req.body.secondary_color || '#764ba2').trim(),
                'admin_accent_color': String(req.body.accent_color || '#f093fb').trim(),
                'admin_success_color': String(req.body.success_color || '#10b981').trim(),
                'admin_warning_color': String(req.body.warning_color || '#f59e0b').trim(),
                'admin_danger_color': String(req.body.danger_color || '#ef4444').trim(),
                'admin_info_color': String(req.body.info_color || '#3b82f6').trim()
            };
            
            // Validate all colors are valid hex codes
            for (const [key, value] of Object.entries(colors)) {
                if (!hexColorRegex.test(value)) {
                    return res.redirect(`/admin/settings?error=Invalid color format for ${key}&section=colors`);
                }
            }
            
            // Save colors to database
            for (const [key, value] of Object.entries(colors)) {
                await db.query(
                    "INSERT INTO config (`key`, `value`, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()",
                    [key, value]
                );
            }
            
            // Log the action
            const currentAdmin = require('../../middleware/auth').getCurrentAdmin(req);
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: 'Updated admin color theme',
                target_type: 'settings',
                ip: req.ip
            });
            
            res.redirect('/admin/settings?message=saved&section=colors');
        } else if (section === 'mailjet') {
            const mailjetSettings = {
                'mailjet_api_key': sanitizeString(req.body.mailjet_api_key || ''),
                'mailjet_api_secret': sanitizeString(req.body.mailjet_api_secret || ''),
                'mailjet_from_email': sanitizeString(req.body.mailjet_from_email || ''),
                'mailjet_from_name': sanitizeString(req.body.mailjet_from_name || 'Minecraft Server')
            };
            
            for (const [key, value] of Object.entries(mailjetSettings)) {
                await db.query(
                    "INSERT INTO config (`key`, `value`, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()",
                    [key, value]
                );
            }
            
            res.redirect('/admin/settings?message=saved&section=mailjet');
        } else {
            res.redirect('/admin/settings');
        }
    } catch (error) {
        console.error('Settings save error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

