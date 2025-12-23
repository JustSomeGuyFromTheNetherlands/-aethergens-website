const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const editCategory = req.query.edit;
        
        const categories = await db.fetchAll("SELECT DISTINCT category FROM rules ORDER BY category");
        const allRules = {};
        
        for (const cat of categories) {
            const rules = await db.fetchAll("SELECT rule_text FROM rules WHERE category = ? ORDER BY order_index", [cat.category]);
            allRules[cat.category] = rules.map(r => r.rule_text);
        }
        
        res.render('admin/rules', {
            pageName: 'rules',
            pageTitle: 'Rules',
            pageSubtitle: 'Manage server rules',
            editCategory,
            allRules,
            message: req.query.message
        });
    } catch (error) {
        console.error('Rules page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { action, category, rules } = req.body;
        
        if (action === 'save') {
            const categoryTrimmed = sanitizeString(category);
            const rulesArray = rules.split('\n').map(r => sanitizeString(r.trim())).filter(r => r);
            
            if (categoryTrimmed && rulesArray.length > 0) {
                await db.delete('rules', 'category = ?', [categoryTrimmed]);
                
                for (let i = 0; i < rulesArray.length; i++) {
                    await db.insert('rules', {
                        category: categoryTrimmed,
                        rule_text: rulesArray[i],
                        order_index: i
                    });
                }
                
                res.redirect('/admin/rules?message=saved');
            } else {
                res.redirect('/admin/rules?error=invalid');
            }
        } else if (action === 'delete') {
            await db.delete('rules', 'category = ?', [sanitizeString(category)]);
            res.redirect('/admin/rules?message=deleted');
        } else {
            res.redirect('/admin/rules');
        }
    } catch (error) {
        console.error('Rule action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;


