const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');
const { sendApplicationWebhook } = require('../../utils/webhooks');
const { writeBotDataFile } = require('../../utils/botDataWriter');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const roles = await db.fetchAll("SELECT * FROM application_roles ORDER BY created_at DESC");
        const pendingApps = await db.fetchAll("SELECT * FROM applications_pending WHERE status = 'pending' ORDER BY created_at DESC");
        
        res.render('admin/applications', {
            pageName: 'applications',
            pageTitle: 'Applications',
            pageSubtitle: 'Manage staff applications',
            roles,
            pendingApps,
            message: req.query.message
        });
    } catch (error) {
        console.error('Applications page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const currentAdmin = getCurrentAdmin(req);
        const { action, role, description, requirements, status, app_id, decision } = req.body;
        
        if (action === 'add_role') {
            await db.insert('application_roles', {
                role: sanitizeString(role),
                description: sanitizeString(description || ''),
                requirements: sanitizeString(requirements || ''),
                status: sanitizeString(status || 'open')
            });
            res.redirect('/admin/applications?message=role_added');
        } else if (action === 'review') {
            const appData = await db.fetchOne("SELECT * FROM applications_pending WHERE id = ?", [parseInt(app_id)]);
            
            await db.update('applications_pending', {
                status: decision === 'accepted' ? 'accepted' : 'rejected',
                reviewed_by: currentAdmin,
                reviewed_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }, 'id = ?', [parseInt(app_id)]);
            
            if (appData) {
                appData.reviewed_by = currentAdmin;
                await sendApplicationWebhook(appData, decision === 'accepted' ? 'accepted' : 'rejected');
            }
            
            await writeBotDataFile();
            res.redirect('/admin/applications?message=reviewed');
        } else if (action === 'delete') {
            await db.delete('applications_pending', 'id = ?', [parseInt(app_id)]);
            await writeBotDataFile();
            res.redirect('/admin/applications?message=deleted');
        } else {
            res.redirect('/admin/applications');
        }
    } catch (error) {
        console.error('Application action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

