const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');
const { sanitizeString } = require('../../utils/validation');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const entries = await db.fetchAll(`
            SELECT wof.*, p.username, p.playtime, p.join_count, p.total_kills, p.total_deaths, p.level, p.balance
            FROM wall_of_fame wof
            LEFT JOIN players p ON wof.player_username = p.username
            ORDER BY wof.created_at DESC
        `);
        
        res.render('admin/wall-of-fame', {
            pageName: 'wall-of-fame',
            pageTitle: 'Wall of Fame',
            pageSubtitle: 'Manage featured players and achievements',
            entries,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Wall of Fame page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const currentAdmin = getCurrentAdmin(req);
        const { action, entry_id, player_username, achievement, description, featured } = req.body;
        
        if (action === 'add') {
            const usernameTrimmed = sanitizeString(player_username);
            const achievementTrimmed = sanitizeString(achievement);
            const descriptionTrimmed = sanitizeString(description || '');
            
            if (!usernameTrimmed || !achievementTrimmed) {
                return res.redirect('/admin/wall-of-fame?error=Username and achievement are required');
            }
            
            // Check if player exists
            const player = await db.fetchOne("SELECT username FROM players WHERE username = ?", [usernameTrimmed]);
            if (!player) {
                return res.redirect('/admin/wall-of-fame?error=Player not found in database');
            }
            
            // Check if entry already exists for this player
            const existing = await db.fetchOne("SELECT id FROM wall_of_fame WHERE player_username = ? AND achievement = ?", [usernameTrimmed, achievementTrimmed]);
            if (existing) {
                return res.redirect('/admin/wall-of-fame?error=Entry already exists for this player and achievement');
            }
            
            const entryId = await db.insert('wall_of_fame', {
                player_username: usernameTrimmed,
                achievement: achievementTrimmed,
                description: descriptionTrimmed,
                featured: featured === 'on' || featured === '1' ? 1 : 0,
                created_by: currentAdmin
            });
            
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: `Added wall of fame entry: ${usernameTrimmed} - ${achievementTrimmed}`,
                target_type: 'wall_of_fame',
                target_id: entryId,
                ip: req.ip
            });
            
            res.redirect('/admin/wall-of-fame?message=added');
        } else if (action === 'update') {
            const achievementTrimmed = sanitizeString(achievement);
            const descriptionTrimmed = sanitizeString(description || '');
            
            await db.update('wall_of_fame', {
                achievement: achievementTrimmed,
                description: descriptionTrimmed,
                featured: featured === 'on' || featured === '1' ? 1 : 0
            }, 'id = ?', [parseInt(entry_id)]);
            
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: `Updated wall of fame entry: ${entry_id}`,
                target_type: 'wall_of_fame',
                target_id: parseInt(entry_id),
                ip: req.ip
            });
            
            res.redirect('/admin/wall-of-fame?message=updated');
        } else if (action === 'delete') {
            await db.query("DELETE FROM wall_of_fame WHERE id = ?", [parseInt(entry_id)]);
            
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: `Deleted wall of fame entry: ${entry_id}`,
                target_type: 'wall_of_fame',
                ip: req.ip
            });
            
            res.redirect('/admin/wall-of-fame?message=deleted');
        } else {
            res.redirect('/admin/wall-of-fame');
        }
    } catch (error) {
        console.error('Wall of Fame action error:', error);
        res.redirect('/admin/wall-of-fame?error=' + encodeURIComponent(error.message));
    }
});

module.exports = router;


