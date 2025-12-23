const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const notifications = await db.fetchAll("SELECT * FROM notifications ORDER BY created_at DESC");
        
        res.render('admin/notifications', {
            pageName: 'notifications',
            pageTitle: 'Notifications',
            pageSubtitle: 'Manage announcements and downtime notifications',
            notifications,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Notifications page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const currentAdmin = getCurrentAdmin(req);
        const { action, id, type, title, message, start_date, end_date, priority, active } = req.body;
        
        if (action === 'add' || action === 'edit') {
            if (!title || !message) {
                return res.redirect('/admin/notifications?error=missing_fields');
            }
            
            const data = {
                type: sanitizeString(type || 'announcement'),
                title: sanitizeString(title),
                message: sanitizeString(message),
                start_date: start_date || null,
                end_date: end_date || null,
                priority: sanitizeString(priority || 'normal'),
                active: active ? 1 : 0
            };
            
            if (action === 'add') {
                data.created_by = currentAdmin;
                await db.insert('notifications', data);
                res.redirect('/admin/notifications?message=added');
            } else {
                await db.update('notifications', data, 'id = ?', [parseInt(id)]);
                res.redirect('/admin/notifications?message=updated');
            }
        } else if (action === 'delete') {
            await db.query("DELETE FROM notifications WHERE id = ?", [parseInt(id)]);
            res.redirect('/admin/notifications?message=deleted');
        } else if (action === 'toggle') {
            const current = await db.fetchOne("SELECT active FROM notifications WHERE id = ?", [parseInt(id)]);
            const newStatus = current && current.active ? 0 : 1;
            await db.update('notifications', { active: newStatus }, 'id = ?', [parseInt(id)]);
            res.redirect('/admin/notifications?message=toggled');
        } else {
            res.redirect('/admin/notifications');
        }
    } catch (error) {
        console.error('Notification action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;


