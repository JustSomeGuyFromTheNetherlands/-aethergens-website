const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');

router.get('/:username', async (req, res) => {
    try {
        const db = getDB();
        const username = req.params.username;
        
        const player = await db.fetchOne("SELECT * FROM players WHERE username = ?", [username]);
        
        if (!player) {
            return res.status(404).render('error', { error: 'Player not found' });
        }
        
        // Get player bans
        const bans = await db.fetchAll(
            "SELECT * FROM bans WHERE player_username = ? ORDER BY ban_date DESC",
            [username]
        );
        
        // Get player appeals
        const appeals = await db.fetchAll(
            "SELECT * FROM appeals WHERE player_username = ? ORDER BY created_at DESC",
            [username]
        );
        
        // Calculate playtime
        const playtimeSeconds = parseInt(player.playtime || 0);
        const playtimeHours = Math.floor(playtimeSeconds / 3600);
        const playtimeMinutes = Math.floor((playtimeSeconds % 3600) / 60);
        const playtimeDays = Math.floor(playtimeHours / 24);
        
        // Get account age
        const firstSeen = new Date(player.first_seen);
        const accountAgeDays = Math.floor((Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
        
        // Get last seen info
        const lastSeen = new Date(player.last_seen);
        const isOnline = (Date.now() - lastSeen.getTime()) < 5 * 60 * 1000;
        const timeSinceLastSeen = Math.floor((Date.now() - lastSeen.getTime()) / 1000);
        
        // Get join count
        const joinCount = parseInt(player.join_count || 0);
        
        res.render('admin/player-detail', {
            pageName: 'players',
            pageTitle: `Player: ${username}`,
            pageSubtitle: 'View detailed player information',
            player,
            bans,
            appeals,
            playtimeHours,
            playtimeMinutes,
            playtimeDays,
            accountAgeDays,
            isOnline,
            timeSinceLastSeen,
            joinCount
        });
    } catch (error) {
        console.error('Player detail error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

