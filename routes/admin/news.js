const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');
const { sendNewsWebhook } = require('../../utils/webhooks');
const { writeBotDataFile } = require('../../utils/botDataWriter');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const editId = req.query.edit;
        let editItem = null;
        
        if (editId) {
            editItem = await db.fetchOne("SELECT * FROM news WHERE id = ?", [parseInt(editId)]);
        }
        
        const news = await db.fetchAll("SELECT * FROM news ORDER BY created_at DESC");
        
        res.render('admin/news', {
            pageName: 'news',
            pageTitle: 'News',
            pageSubtitle: 'Manage server announcements',
            editItem,
            news,
            message: req.query.message
        });
    } catch (error) {
        console.error('News page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const currentAdmin = getCurrentAdmin(req);
        const { action, id, title, content, published } = req.body;
        
        if (action === 'add') {
            const newsId = await db.insert('news', {
                title: sanitizeString(title),
                content: sanitizeString(content),
                author: currentAdmin,
                published: published ? 1 : 0,
                publish_date: published ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
            });
            
            if (published) {
                const newsItem = await db.fetchOne("SELECT * FROM news WHERE id = ?", [newsId]);
                await sendNewsWebhook(newsItem, 'created');
            }
            
            await writeBotDataFile();
            res.redirect('/admin/news?message=added');
        } else if (action === 'update') {
            const oldNews = await db.fetchOne("SELECT * FROM news WHERE id = ?", [parseInt(id)]);
            
            await db.update('news', {
                title: sanitizeString(title),
                content: sanitizeString(content),
                published: published ? 1 : 0,
                publish_date: published ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
            }, 'id = ?', [parseInt(id)]);
            
            const newsItem = await db.fetchOne("SELECT * FROM news WHERE id = ?", [parseInt(id)]);
            const webhookAction = (oldNews.published !== newsItem.published) ? 'created' : 'updated';
            if (newsItem.published) {
                await sendNewsWebhook(newsItem, webhookAction);
            }
            
            await writeBotDataFile();
            res.redirect('/admin/news?message=updated');
        } else if (action === 'delete') {
            const newsItem = await db.fetchOne("SELECT * FROM news WHERE id = ?", [parseInt(id)]);
            await db.delete('news', 'id = ?', [parseInt(id)]);
            
            if (newsItem) {
                await sendNewsWebhook(newsItem, 'deleted');
            }
            
            await writeBotDataFile();
            res.redirect('/admin/news?message=deleted');
        } else {
            res.redirect('/admin/news');
        }
    } catch (error) {
        console.error('News action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;


