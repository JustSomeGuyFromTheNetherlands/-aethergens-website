const { getDB } = require('../database');
const { getServerStatus } = require('./minecraftQuery');

async function updatePlayersAuto() {
  const db = getDB();
  
  try {
    // Check last update time (rate limit: 2 minutes)
    const lastUpdate = await db.fetchOne("SELECT value FROM config WHERE `key` = 'player_tracker_last_update'");
    const lastUpdateTime = lastUpdate ? parseInt(lastUpdate.value) : 0;
    const now = Math.floor(Date.now() / 1000);
    
    // Only update if 2+ minutes have passed
    if ((now - lastUpdateTime) < 120) {
      return; // Too soon, skip update
    }
    
    // Update last update time immediately to prevent concurrent requests
    await db.query(
      `INSERT INTO config (\`key\`, \`value\`, updated_at) 
       VALUES ('player_tracker_last_update', ?, NOW())
       ON DUPLICATE KEY UPDATE \`value\` = ?, updated_at = NOW()`,
      [now.toString(), now.toString()]
    );
    
    // Get server settings
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    if (!serverSettings) {
      return;
    }
    
    // Get current server status
    const status = await getServerStatus();
    
    if (!status.online) {
      // Server is offline, mark all currently tracked players as offline
      await db.query("UPDATE players SET last_seen = NOW() WHERE last_seen > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
      return;
    }
    
    // Get currently online players
    const currentOnline = status.player_list || [];
    
    // Get players we're currently tracking as "online" (seen in last 5 minutes)
    const trackedOnline = await db.fetchAll(
      `SELECT username, uuid, last_seen, playtime 
       FROM players 
       WHERE last_seen > DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
    );
    
    const trackedUsernames = trackedOnline.map(p => p.username);
    
    // Process each currently online player
    for (const username of currentOnline) {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) continue;
      
      // Check if player exists in database
      const player = await db.fetchOne("SELECT * FROM players WHERE username = ?", [trimmedUsername]);
      
      if (!player) {
        // New player - create record
        await db.insert('players', {
          username: trimmedUsername,
          first_seen: new Date().toISOString().slice(0, 19).replace('T', ' '),
          last_seen: new Date().toISOString().slice(0, 19).replace('T', ' '),
          playtime: 0,
          rank: 'member'
        });
      } else {
        // Update last_seen timestamp
        await db.query("UPDATE players SET last_seen = NOW() WHERE username = ?", [trimmedUsername]);
      }
    }
    
    // Process players who are no longer online
    for (const trackedPlayer of trackedOnline) {
      const username = trackedPlayer.username;
      
      if (!currentOnline.includes(username)) {
        // Player went offline - calculate session playtime and add to total
        const lastSeen = new Date(trackedPlayer.last_seen).getTime();
        const sessionTime = Math.floor((Date.now() - lastSeen) / 1000);
        
        // Add session time to total playtime (in seconds)
        const newPlaytime = parseInt(trackedPlayer.playtime) + sessionTime;
        
        await db.query("UPDATE players SET playtime = ?, last_seen = NOW() WHERE username = ?", [
          newPlaytime,
          username
        ]);
      }
    }
    
    // Update player count stats
    const totalPlayers = currentOnline.length;
    const totalPlayersCount = (await db.fetchOne("SELECT COUNT(*) as count FROM players"))?.count || 0;
    const existingPeak = (await db.fetchOne("SELECT peak_players FROM server_stats WHERE stat_date = CURDATE()"))?.peak_players || 0;
    const newPeak = Math.max(existingPeak, totalPlayers);
    
    await db.query(
      `INSERT INTO server_stats (stat_date, online_players, total_players, peak_players, created_at)
       VALUES (CURDATE(), ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
         online_players = ?,
         total_players = ?,
         peak_players = GREATEST(peak_players, ?),
         updated_at = NOW()`,
      [totalPlayers, totalPlayersCount, newPeak, totalPlayers, totalPlayersCount, totalPlayers]
    );
    
  } catch (error) {
    console.error('Player tracker error:', error.message);
  }
}

module.exports = {
  updatePlayersAuto
};


