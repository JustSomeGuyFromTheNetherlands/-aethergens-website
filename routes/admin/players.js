const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { getCurrentAdmin } = require('../../middleware/auth');
const { getRCON } = require('../../utils/rcon');
const { sendBanWebhook } = require('../../utils/webhooks');
const { sanitizeString } = require('../../utils/validation');
const { getServerStatus } = require('../../utils/minecraftQuery');
const { updatePlayersAuto } = require('../../utils/playerTracker');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        
        // Auto-sync players with server
        try {
            await updatePlayersAuto();
        } catch (error) {
            console.error('Player sync error:', error.message);
        }
        
        const filter = req.query.filter || 'all';
        const search = req.query.search || '';
        
        // Get current online players from server
        let onlinePlayers = [];
        try {
            const serverStatus = await getServerStatus();
            onlinePlayers = serverStatus.player_list || [];
        } catch (error) {
            console.error('Failed to get online players:', error.message);
        }
        
        let query = "SELECT *, TIMESTAMPDIFF(SECOND, first_seen, NOW()) as account_age, playtime as total_playtime FROM players";
        const params = [];
        const conditions = [];
        
        if (search) {
            conditions.push("username LIKE ?");
            params.push(`%${search}%`);
        }
        
        switch (filter) {
            case 'online':
                conditions.push("last_seen > DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
                break;
            case 'offline':
                conditions.push("last_seen <= DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
                break;
            case 'banned':
                conditions.push("banned = 1");
                break;
            case 'muted':
                conditions.push("muted = 1");
                break;
            case 'new':
                conditions.push("first_seen > DATE_SUB(NOW(), INTERVAL 7 DAY)");
                break;
        }
        
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        
        query += " ORDER BY last_seen DESC";
        
        const players = await db.fetchAll(query, params);
        
        // Enhance players with online status and formatted playtime
        const enhancedPlayers = players.map(player => {
            const isOnline = onlinePlayers.includes(player.username) || 
                           (new Date(player.last_seen).getTime() > Date.now() - 5 * 60 * 1000);
            const playtimeSeconds = parseInt(player.total_playtime || 0);
            const hours = Math.floor(playtimeSeconds / 3600);
            const minutes = Math.floor((playtimeSeconds % 3600) / 60);
            const playtimeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            
            return {
                ...player,
                isOnline,
                playtimeFormatted,
                playtimeHours: hours,
                playtimeMinutes: minutes
            };
        });
        
        const stats = {
            total: (await db.fetchOne("SELECT COUNT(*) as count FROM players"))?.count || 0,
            online: onlinePlayers.length,
            banned: (await db.fetchOne("SELECT COUNT(*) as count FROM players WHERE banned = 1"))?.count || 0,
            newToday: (await db.fetchOne("SELECT COUNT(*) as count FROM players WHERE DATE(first_seen) = CURDATE()"))?.count || 0
        };
        
        res.render('admin/players', {
            pageName: 'players',
            pageTitle: 'Players',
            pageSubtitle: 'Manage player database',
            players: enhancedPlayers,
            stats,
            filter,
            search,
            message: req.query.message,
            error: req.query.error
        });
    } catch (error) {
        console.error('Players page error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/export', async (req, res) => {
    try {
        const db = getDB();
        const { format = 'csv', filter = 'all', search = '' } = req.body;
        
        let query = "SELECT * FROM players WHERE 1=1";
        const params = [];
        
        if (search) {
            query += " AND username LIKE ?";
            params.push(`%${search}%`);
        }
        
        switch (filter) {
            case 'online':
                query += " AND last_seen > DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
                break;
            case 'banned':
                query += " AND banned = 1";
                break;
            case 'muted':
                query += " AND muted = 1";
                break;
        }
        
        query += " ORDER BY last_seen DESC";
        const players = await db.fetchAll(query, params);
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=players_${Date.now()}.csv`);
            
            let csv = 'Username,UUID,Rank,Playtime (seconds),First Seen,Last Seen,Banned,Muted\n';
            players.forEach(player => {
                csv += `"${player.username}","${player.uuid || ''}","${player.rank || ''}",${player.playtime || 0},"${player.first_seen}","${player.last_seen}",${player.banned ? 'Yes' : 'No'},${player.muted ? 'Yes' : 'No'}\n`;
            });
            
            res.send(csv);
        } else {
            res.json({ success: true, players });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const currentAdmin = getCurrentAdmin(req);
        const { action, bulk_action, selected_players, username, reason, expires } = req.body;
        
        if (action === 'bulk' && bulk_action && selected_players) {
            const usernames = Array.isArray(selected_players) ? selected_players : [selected_players];
            let count = 0;
            
            let rconConnected = false;
            let rcon = null;
            
            // Try to connect RCON once for bulk operations
            try {
                rcon = await getRCON();
                await rcon.connect();
                rconConnected = true;
            } catch (error) {
                console.error('RCON connection failed for bulk actions:', error.message);
            }
            
            for (const user of usernames) {
                const userTrimmed = sanitizeString(user);
                if (!userTrimmed) continue;
                
                switch (bulk_action) {
                    case 'ban':
                        let banRconSuccess = false;
                        if (rconConnected) {
                            try {
                                await rcon.banPlayer(userTrimmed, 'Bulk ban by admin');
                                banRconSuccess = true;
                            } catch (error) {
                                console.error(`RCON ban failed for ${userTrimmed}:`, error.message);
                            }
                        }
                        
                        const banId = await db.insert('bans', {
                            player_username: userTrimmed,
                            banned_by: currentAdmin,
                            reason: 'Bulk ban by admin',
                            ban_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                            active: 1
                        });
                        
                        await db.update('players', { banned: 1, ban_reason: 'Bulk ban by admin' }, 'username = ?', [userTrimmed]);
                        
                        await db.insert('admin_log', {
                            admin: currentAdmin,
                            action: `Bulk banned player: ${userTrimmed}${banRconSuccess ? ' [RCON: Success]' : ' [RCON: Failed]'}`,
                            target_type: 'player',
                            target_id: banId,
                            ip: req.ip
                        });
                        
                        count++;
                        break;
                    case 'unban':
                        let unbanRconSuccess = false;
                        if (rconConnected) {
                            try {
                                await rcon.unbanPlayer(userTrimmed);
                                unbanRconSuccess = true;
                            } catch (error) {
                                console.error(`RCON unban failed for ${userTrimmed}:`, error.message);
                            }
                        }
                        
                        await db.update('players', { banned: 0, ban_reason: null }, 'username = ?', [userTrimmed]);
                        await db.query("UPDATE bans SET active = 0 WHERE player_username = ? AND active = 1", [userTrimmed]);
                        
                        await db.insert('admin_log', {
                            admin: currentAdmin,
                            action: `Bulk unbanned player: ${userTrimmed}${unbanRconSuccess ? ' [RCON: Success]' : ' [RCON: Failed]'}`,
                            target_type: 'player',
                            ip: req.ip
                        });
                        
                        count++;
                        break;
                    case 'mute':
                        await db.update('players', { muted: 1, mute_reason: 'Bulk mute by admin' }, 'username = ?', [userTrimmed]);
                        count++;
                        break;
                    case 'unmute':
                        await db.update('players', { muted: 0, mute_reason: null }, 'username = ?', [userTrimmed]);
                        count++;
                        break;
                    case 'delete':
                        await db.query("DELETE FROM players WHERE username = ?", [userTrimmed]);
                        count++;
                        break;
                }
            }
            
            // Disconnect RCON if connected
            if (rconConnected && rcon) {
                try {
                    rcon.disconnect();
                } catch (error) {
                    console.error('RCON disconnect error:', error.message);
                }
            }
            
            res.redirect(`/admin/players?message=Bulk action completed: ${bulk_action} applied to ${count} players`);
        } else if (action === 'ban') {
            const usernameTrimmed = sanitizeString(username);
            const reasonTrimmed = sanitizeString(reason);
            
            if (!reasonTrimmed) {
                return res.redirect('/admin/players?error=Ban reason is required');
            }
            
            let rconSuccess = false;
            let rconError = null;
            try {
                const rcon = await getRCON();
                await rcon.connect();
                // Use /ban command via RCON
                await rcon.banPlayer(usernameTrimmed, reasonTrimmed);
                rcon.disconnect();
                rconSuccess = true;
            } catch (error) {
                console.error('RCON ban failed:', error);
                rconError = error.message;
            }
            
            const banId = await db.insert('bans', {
                player_username: usernameTrimmed,
                banned_by: currentAdmin,
                reason: reasonTrimmed,
                expires_at: expires || null,
                active: 1
            });
            
            await db.update('players', { banned: 1, ban_reason: reasonTrimmed }, 'username = ?', [usernameTrimmed]);
            
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: `Banned player: ${usernameTrimmed} (Reason: ${reasonTrimmed})${rconSuccess ? ' [RCON: Success]' : ` [RCON: Failed - ${rconError || 'Unknown'}]`}`,
                target_type: 'player',
                target_id: banId,
                ip: req.ip
            });
            
            const banData = await db.fetchOne("SELECT * FROM bans WHERE id = ?", [banId]);
            await sendBanWebhook(banData, 'created');
            
            const message = `Player ${usernameTrimmed} has been banned${rconSuccess ? ' on server and database' : ' (database only - RCON failed)'}`;
            res.redirect(`/admin/players?message=${encodeURIComponent(message)}`);
        } else if (action === 'unban') {
            const usernameTrimmed = sanitizeString(username);
            
            let rconSuccess = false;
            try {
                const rcon = await getRCON();
                await rcon.connect();
                // Use /pardon command via RCON
                await rcon.unbanPlayer(usernameTrimmed);
                rcon.disconnect();
                rconSuccess = true;
            } catch (error) {
                console.error('RCON unban failed:', error);
            }
            
            await db.update('players', { banned: 0, ban_reason: null }, 'username = ?', [usernameTrimmed]);
            await db.query("UPDATE bans SET active = 0 WHERE player_username = ? AND active = 1", [usernameTrimmed]);
            
            await db.insert('admin_log', {
                admin: currentAdmin,
                action: `Unbanned player: ${usernameTrimmed}${rconSuccess ? ' [RCON: Success]' : ' [RCON: Failed]'}`,
                target_type: 'player',
                ip: req.ip
            });
            
            const message = `Player ${usernameTrimmed} has been unbanned${rconSuccess ? ' on server and database' : ' (database only - RCON failed)'}`;
            res.redirect(`/admin/players?message=${encodeURIComponent(message)}`);
        } else if (action === 'mute') {
            const usernameTrimmed = sanitizeString(username);
            const reasonTrimmed = sanitizeString(reason || '');
            await db.update('players', { muted: 1, mute_reason: reasonTrimmed }, 'username = ?', [usernameTrimmed]);
            res.redirect(`/admin/players?message=Player ${usernameTrimmed} has been muted`);
        } else if (action === 'unmute') {
            const usernameTrimmed = sanitizeString(username);
            await db.update('players', { muted: 0, mute_reason: null }, 'username = ?', [usernameTrimmed]);
            res.redirect(`/admin/players?message=Player ${usernameTrimmed} has been unmuted`);
        } else if (action === 'delete') {
            const usernameTrimmed = sanitizeString(username);
            await db.query("DELETE FROM players WHERE username = ?", [usernameTrimmed]);
            res.redirect(`/admin/players?message=Player ${usernameTrimmed} has been deleted`);
        } else {
            res.redirect('/admin/players');
        }
    } catch (error) {
        console.error('Player action error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;

