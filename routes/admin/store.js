const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const categories = await db.fetchAll("SELECT * FROM store_categories ORDER BY order_index ASC");
        const items = await db.fetchAll("SELECT si.*, sc.name as category_name FROM store_items si LEFT JOIN store_categories sc ON si.category_id = sc.id ORDER BY si.created_at DESC");
        
        res.render('admin/store', {
            pageName: 'store',
            pageTitle: 'Store',
            pageSubtitle: 'Manage server store items',
            categories,
            items,
            message: req.query.message
        });
    } catch (error) {
        console.error('Store page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { action, name, description, icon, category_id, price, command, icon_url, featured } = req.body;
        
        if (action === 'add_category') {
            await db.insert('store_categories', {
                name: sanitizeString(name),
                description: sanitizeString(description || ''),
                icon: sanitizeString(icon || '')
            });
            res.redirect('/admin/store?message=category_added');
        } else if (action === 'add_item') {
            await db.insert('store_items', {
                category_id: parseInt(category_id),
                name: sanitizeString(name),
                description: sanitizeString(description || ''),
                price: parseFloat(price),
                command: sanitizeString(command || ''),
                // Don't sanitize URLs - just trim, validation handles security
                icon_url: String(icon_url || '').trim(),
                featured: featured ? 1 : 0
            });
            res.redirect('/admin/store?message=item_added');
        } else {
            res.redirect('/admin/store');
        }
    } catch (error) {
        console.error('Store action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

