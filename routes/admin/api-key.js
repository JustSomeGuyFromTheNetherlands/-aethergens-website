const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDB } = require('../../database');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const apiKeyResult = await db.fetchOne("SELECT value FROM config WHERE `key` = ?", ['api_key']);
        const apiKey = apiKeyResult?.value || null;
        
        res.render('admin/api-key', {
            pageName: 'api-key',
            pageTitle: 'API Key',
            pageSubtitle: 'REST API Authentication',
            apiKey,
            message: req.query.message
        });
    } catch (error) {
        console.error('API Key page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { action } = req.body;
        
        if (action === 'generate') {
            const newKey = crypto.randomBytes(32).toString('hex');
            await db.query(
                "INSERT INTO config (`key`, `value`, updated_at) VALUES ('api_key', ?, NOW()) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()",
                [newKey]
            );
            res.redirect('/admin/api-key?message=generated');
        } else {
            res.redirect('/admin/api-key');
        }
    } catch (error) {
        console.error('API Key action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

