const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');
const { sendAppealWebhook } = require('../../utils/webhooks');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const appeals = await db.fetchAll(
            "SELECT a.*, b.reason as ban_reason FROM appeals a LEFT JOIN bans b ON a.ban_id = b.id WHERE a.status = 'pending' ORDER BY created_at DESC"
        );
        
        res.render('admin/appeals', {
            pageName: 'appeals',
            pageTitle: 'Appeals',
            pageSubtitle: 'Review and process ban appeals',
            appeals,
            message: req.query.message
        });
    } catch (error) {
        console.error('Appeals page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const currentAdmin = getCurrentAdmin(req);
        const { action, appeal_id, decision } = req.body;
        
        if (action === 'review') {
            await db.update('appeals', {
                status: decision,
                reviewed_by: currentAdmin,
                reviewed_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }, 'id = ?', [parseInt(appeal_id)]);
            
            const appealData = await db.fetchOne("SELECT * FROM appeals WHERE id = ?", [parseInt(appeal_id)]);
            if (appealData) {
                await sendAppealWebhook(appealData, decision === 'accepted' ? 'accepted' : 'denied');
            }
            
            res.redirect('/admin/appeals?message=reviewed');
        } else {
            res.redirect('/admin/appeals');
        }
    } catch (error) {
        console.error('Appeal action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

