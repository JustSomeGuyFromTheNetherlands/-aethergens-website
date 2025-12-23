const fs = require('fs');
const path = require('path');
const { getDB } = require('../database');
const config = require('../config');

async function writeBotDataFile() {
  try {
    const db = getDB();
    const fs = require('fs');
    const path = require('path');
    const config = require('../config');
    
    const server = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    const data = {
      timestamp: Math.floor(Date.now() / 1000),
      news: await db.fetchAll("SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC LIMIT 10"),
      bans: await db.fetchAll("SELECT * FROM bans ORDER BY ban_date DESC LIMIT 10"),
      appeals: await db.fetchAll("SELECT * FROM appeals ORDER BY created_at DESC LIMIT 10"),
      applications: await db.fetchAll("SELECT * FROM applications_pending ORDER BY created_at DESC LIMIT 10"),
      players: await db.fetchAll("SELECT * FROM players WHERE first_seen > DATE_SUB(NOW(), INTERVAL 1 HOUR) ORDER BY first_seen DESC LIMIT 10"),
      server: server || {}
    };
    
    const publicDir = path.join(config.basePath, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filePath = path.join(publicDir, 'bot-data.json');
    fs.writeFileSync(filePath, JSON.stringify({ success: true, data }, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error writing bot data file:', error.message);
    return false;
  }
}

module.exports = { writeBotDataFile };

