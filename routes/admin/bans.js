const express = require('express');
const router = express.Router();
const { requireAuth, getCurrentAdmin } = require('../../middleware/auth');
const { getDB } = require('../../database');
const { getRCON } = require('../../utils/rcon');
const { sendBanWebhook } = require('../../utils/webhooks');
const { writeBotDataFile } = require('../../utils/botDataWriter');
const { sendBanNotificationEmail } = require('../../utils/mailjet');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const currentAdmin = getCurrentAdmin(req);
    const filter = req.query.filter || 'active';
    const search = req.query.search || '';
    const banType = req.query.type || 'all'; // 'all', 'player', 'ip'
    
    let query = "SELECT * FROM bans WHERE 1=1";
    const params = [];
    
    // Filter by ban type
    if (banType === 'player') {
      query += " AND (ban_type IS NULL OR ban_type = 'player')";
    } else if (banType === 'ip') {
      query += " AND ban_type = 'ip'";
    }
    
    if (filter === 'active') {
      query += " AND active = 1";
    } else if (filter === 'expired') {
      query += " AND active = 1 AND expires_at IS NOT NULL AND expires_at < NOW()";
    } else if (filter === 'inactive') {
      query += " AND active = 0";
    }
    
    if (search) {
      query += " AND (player_username LIKE ? OR ip_address LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += " ORDER BY ban_date DESC";
    const bans = await db.fetchAll(query, params);
    
    // Get stats
    const stats = {
      total: (await db.fetchOne("SELECT COUNT(*) as count FROM bans").catch(() => ({ count: 0 })))?.count || 0,
      active: (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE active = 1").catch(() => ({ count: 0 })))?.count || 0,
      expired: (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE active = 1 AND expires_at IS NOT NULL AND expires_at < NOW()").catch(() => ({ count: 0 })))?.count || 0,
      inactive: (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE active = 0").catch(() => ({ count: 0 })))?.count || 0,
      playerBans: (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE (ban_type IS NULL OR ban_type = 'player') AND active = 1").catch(() => ({ count: 0 })))?.count || 0,
      ipBans: (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE ban_type = 'ip' AND active = 1").catch(() => ({ count: 0 })))?.count || 0
    };
    
    res.render('admin/bans', {
      pageTitle: 'Ban Management',
      pageSubtitle: 'Manage player and IP bans',
      bans,
      currentAdmin,
      filter,
      search,
      banType,
      stats,
      message: req.query.message,
      errors: req.session?.ban_errors || []
    });
    
    if (req.session) {
      delete req.session.ban_errors;
    }
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

router.post('/export', async (req, res) => {
    try {
        const db = getDB();
        const { format = 'csv', filter = 'all', search = '', banType = 'all' } = req.body;
        
        let query = "SELECT * FROM bans WHERE 1=1";
        const params = [];
        
        if (banType === 'player') {
            query += " AND (ban_type IS NULL OR ban_type = 'player')";
        } else if (banType === 'ip') {
            query += " AND ban_type = 'ip'";
        }
        
        if (filter === 'active') {
            query += " AND active = 1";
        } else if (filter === 'expired') {
            query += " AND active = 1 AND expires_at IS NOT NULL AND expires_at < NOW()";
        } else if (filter === 'inactive') {
            query += " AND active = 0";
        }
        
        if (search) {
            query += " AND (player_username LIKE ? OR ip_address LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += " ORDER BY ban_date DESC";
        const bans = await db.fetchAll(query, params);
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=bans_${Date.now()}.csv`);
            
            let csv = 'ID,Type,Player/IP,Reason,Banned By,Date,Expires,Active\n';
            bans.forEach(ban => {
                const identifier = ban.ban_type === 'ip' ? ban.ip_address : ban.player_username;
                csv += `${ban.id},"${ban.ban_type || 'player'}","${identifier}","${ban.reason.replace(/"/g, '""')}","${ban.banned_by}","${ban.ban_date}","${ban.expires_at || 'Permanent'}","${ban.active ? 'Yes' : 'No'}"\n`;
            });
            
            res.send(csv);
        } else {
            res.json({ success: true, bans });
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
    const { action, username, uuid, reason, duration, custom_date, player_email, send_email, ban_id, ip_address, ban_type, ip_ban_name } = req.body;
    
    if (action === 'add') {
      const errors = [];
      const isIPBan = ban_type === 'ip';
      
      if (isIPBan) {
        // IP ban validation
        if (!ip_address || !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip_address)) {
          errors.push('Invalid IP address format');
        }
      } else {
        // Player ban validation
        if (!username || !/^[a-zA-Z0-9_]{1,16}$/.test(username)) {
          errors.push('Invalid username format');
        }
        
        if (uuid && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
          errors.push('Invalid UUID format');
        }
      }
      
      if (!reason || reason.length > 500) {
        errors.push('Reason is required and must be 500 characters or less');
      }
      
      let expiresAt = null;
      if (duration === 'custom' && custom_date) {
        expiresAt = new Date(custom_date).toISOString().slice(0, 19).replace('T', ' ');
      } else if (duration !== 'permanent') {
        const days = parseInt(duration);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString().slice(0, 19).replace('T', ' ');
      }
      
      if (errors.length === 0) {
        let existing;
        if (isIPBan) {
          existing = await db.fetchOne("SELECT id FROM bans WHERE ip_address = ? AND active = 1 AND ban_type = 'ip'", [ip_address]);
        } else {
          existing = await db.fetchOne("SELECT id FROM bans WHERE player_username = ? AND active = 1 AND (ban_type IS NULL OR ban_type = 'player')", [username]);
        }
        
        if (existing) {
          errors.push(isIPBan ? 'IP address already has an active ban' : 'Player already has an active ban');
        } else {
          let rconSuccess = false;
          let rconError = null;
          try {
            const rcon = await getRCON();
            await rcon.connect();
            
            if (isIPBan) {
              // Use /ip-ban command via RCON
              await rcon.banIP(ip_address, reason);
            } else {
              // Use /ban command via RCON
              await rcon.banPlayer(username, reason);
            }
            
            rcon.disconnect();
            rconSuccess = true;
          } catch (error) {
            console.error('RCON ban failed:', error.message);
            rconError = error.message;
          }
          
          const banId = await db.insert('bans', {
            ban_type: isIPBan ? 'ip' : 'player',
            player_username: isIPBan ? (ip_ban_name || null) : username,
            player_uuid: isIPBan ? null : (uuid || null),
            ip_address: isIPBan ? ip_address : null,
            banned_by: currentAdmin,
            reason,
            ban_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            expires_at: expiresAt,
            active: 1
          });
          
          if (!isIPBan && username) {
            await db.update('players', { banned: 1, ban_reason: reason }, 'username = ?', [username]);
          }
          
          const banDisplayName = isIPBan ? (ip_ban_name ? `${ip_ban_name} (${ip_address})` : ip_address) : username;
          await db.insert('admin_log', {
            admin: currentAdmin,
            action: `${isIPBan ? 'IP banned' : 'Banned player'}: ${banDisplayName} (Reason: ${reason})${rconSuccess ? ' [RCON: Success]' : ` [RCON: Failed - ${rconError || 'Unknown'}]`}`,
            target_type: 'ban',
            target_id: banId,
            ip: req.ip
          });
          
          const banData = await db.fetchOne("SELECT * FROM bans WHERE id = ?", [banId]);
          await sendBanWebhook(banData, 'created');
          
          if (!isIPBan && send_email && player_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player_email)) {
            await sendBanNotificationEmail(player_email, username, reason, expiresAt, currentAdmin);
          }
          
          await writeBotDataFile();
          return res.redirect(`/admin/bans?message=banned&filter=${encodeURIComponent(req.query.filter || 'active')}&type=${isIPBan ? 'ip' : 'player'}`);
        }
      }
      
      if (req.session) {
        req.session.ban_errors = errors;
      }
      return res.redirect(`/admin/bans?filter=${encodeURIComponent(req.query.filter || 'active')}&type=${ban_type || 'player'}`);
    } else if (action === 'unban') {
      const banData = await db.fetchOne("SELECT * FROM bans WHERE id = ?", [parseInt(ban_id)]);
      
      let rconSuccess = false;
      let rconError = null;
      if (banData) {
        try {
          const rcon = await getRCON();
          await rcon.connect();
          
          if (banData.ban_type === 'ip' && banData.ip_address) {
            // Use /ip-pardon command via RCON
            await rcon.unbanIP(banData.ip_address);
          } else if (banData.player_username) {
            // Use /pardon command via RCON
            await rcon.unbanPlayer(banData.player_username);
          }
          
          rcon.disconnect();
          rconSuccess = true;
        } catch (error) {
          console.error('RCON unban failed:', error.message);
          rconError = error.message;
        }
      }
      
      await db.update('bans', { active: 0 }, 'id = ?', [parseInt(ban_id)]);
      
      if (banData) {
        if (banData.player_username) {
          await db.update('players', { banned: 0, ban_reason: null }, 'username = ?', [banData.player_username]);
        }
        
        await db.insert('admin_log', {
          admin: currentAdmin,
          action: `Unbanned ${banData.ban_type === 'ip' ? 'IP' : 'player'}: ${banData.ban_type === 'ip' ? banData.ip_address : banData.player_username}${rconSuccess ? ' [RCON: Success]' : ` [RCON: Failed - ${rconError || 'Unknown'}]`}`,
          target_type: 'ban',
          target_id: parseInt(ban_id),
          ip: req.ip
        });
        
        await sendBanWebhook(banData, 'removed');
      }
      
      await writeBotDataFile();
      return res.redirect(`/admin/bans?message=unbanned&filter=${encodeURIComponent(req.query.filter || 'active')}&type=${banData?.ban_type || 'all'}`);
    }
    
    res.redirect('/admin/bans');
  } catch (error) {
    console.error('Ban action error:', error);
    res.redirect('/admin/bans?error=' + encodeURIComponent(error.message));
  }
});

module.exports = router;

