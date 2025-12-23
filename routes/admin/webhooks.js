const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { sendDiscordWebhook } = require('../../utils/webhooks');
const { validateUrl, sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const webhookTypes = ['news', 'bans', 'appeals', 'applications', 'players', 'server_status'];
        const webhooks = {};
        
        for (const type of webhookTypes) {
            const webhook = await db.fetchOne("SELECT * FROM webhooks WHERE name = ?", [type]);
            webhooks[type] = webhook || { name: type, url: '', active: 0 };
        }
        
        const proxyResult = await db.fetchOne("SELECT value FROM config WHERE `key` = 'webhook_proxy_url'");
        const proxyUrl = proxyResult?.value || '';
        
        res.render('admin/webhooks', {
            pageName: 'webhooks',
            pageTitle: 'Discord Webhooks',
            pageSubtitle: 'Configure Discord webhook notifications',
            webhooks,
            proxyUrl,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Webhooks page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { action, webhook_name } = req.body;
        
        if (action === 'save') {
            const webhookTypes = ['news', 'bans', 'appeals', 'applications', 'players', 'server_status'];
            
            for (const type of webhookTypes) {
                // Don't sanitize URLs - just trim, validation handles security
                const url = String(req.body[`webhook_${type}`] || '').trim();
                const active = req.body[`active_${type}`] ? 1 : 0;
                
                if (url && !validateUrl(url)) {
                    return res.redirect(`/admin/webhooks?error=Invalid URL format for ${type} webhook`);
                }
                
                // Ensure URL length is reasonable
                if (url && url.length > 500) {
                    return res.redirect(`/admin/webhooks?error=URL too long for ${type} webhook`);
                }
                
                const existing = await db.fetchOne("SELECT id FROM webhooks WHERE name = ?", [type]);
                
                if (existing) {
                    await db.update('webhooks', {
                        url: url,
                        active: active
                    }, 'name = ?', [type]);
                } else if (url) {
                    await db.insert('webhooks', {
                        name: type,
                        url: url,
                        active: active
                    });
                } else {
                    await db.update('webhooks', { active: 0 }, 'name = ?', [type]);
                }
            }
            
            // Don't sanitize URLs - just trim
            const proxyUrl = String(req.body.webhook_proxy_url || '').trim();
            if (proxyUrl) {
                if (!validateUrl(proxyUrl)) {
                    return res.redirect('/admin/webhooks?error=Invalid proxy URL format');
                }
                if (proxyUrl.length > 500) {
                    return res.redirect('/admin/webhooks?error=Proxy URL too long');
                }
                await db.query(
                    "INSERT INTO config (`key`, `value`, updated_at) VALUES ('webhook_proxy_url', ?, NOW()) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()",
                    [proxyUrl]
                );
            } else {
                await db.query("DELETE FROM config WHERE `key` = 'webhook_proxy_url'");
            }
            
            res.redirect('/admin/webhooks?message=saved');
        } else if (action === 'test') {
            if (!webhook_name) {
                return res.redirect('/admin/webhooks?error=No webhook selected');
            }
            
            const webhook = await db.fetchOne("SELECT * FROM webhooks WHERE name = ?", [webhook_name]);
            if (!webhook || !webhook.url) {
                return res.redirect('/admin/webhooks?error=Webhook not configured');
            }
            
            const result = await sendDiscordWebhook(webhook.url, {
                title: 'Test Webhook',
                description: 'This is a test message from your Minecraft Server CMS',
                color: 3066993
            });
            
            if (result) {
                res.redirect('/admin/webhooks?message=Test webhook sent successfully');
            } else {
                res.redirect('/admin/webhooks?error=Failed to send test webhook');
            }
        } else {
            res.redirect('/admin/webhooks');
        }
    } catch (error) {
        console.error('Webhook action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

