const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const editId = req.query.edit;
        let editItem = null;
        
        if (editId) {
            editItem = await db.fetchOne("SELECT * FROM features WHERE id = ?", [parseInt(editId)]);
        }
        
        const features = await db.fetchAll("SELECT * FROM features ORDER BY order_index ASC, created_at DESC");
        
        res.render('admin/features', {
            pageName: 'features',
            pageTitle: 'Features',
            pageSubtitle: 'Manage server features',
            editItem,
            features,
            message: req.query.message
        });
    } catch (error) {
        console.error('Features page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { action, id, title, description, icon, category, order_index } = req.body;
        
        if (action === 'add') {
            await db.insert('features', {
                title: sanitizeString(title),
                description: sanitizeString(description),
                icon: sanitizeString(icon || ''),
                category: sanitizeString(category || 'general'),
                order_index: parseInt(order_index || 0)
            });
            res.redirect('/admin/features?message=added');
        } else if (action === 'update') {
            await db.update('features', {
                title: sanitizeString(title),
                description: sanitizeString(description),
                icon: sanitizeString(icon || ''),
                category: sanitizeString(category || 'general'),
                order_index: parseInt(order_index || 0)
            }, 'id = ?', [parseInt(id)]);
            res.redirect('/admin/features?message=updated');
        } else if (action === 'delete') {
            await db.delete('features', 'id = ?', [parseInt(id)]);
            res.redirect('/admin/features?message=deleted');
        } else {
            res.redirect('/admin/features');
        }
    } catch (error) {
        console.error('Feature action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

