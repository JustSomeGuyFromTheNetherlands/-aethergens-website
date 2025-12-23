const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');

// Migration route to add IP ban support
router.get('/ip-bans', async (req, res) => {
  try {
    const db = getDB();
    
    // Check if columns already exist
    const columns = await db.fetchAll(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'bans'
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    const needsMigration = !columnNames.includes('ban_type') || !columnNames.includes('ip_address');
    
    if (!needsMigration) {
      return res.json({ 
        success: true, 
        message: 'IP ban support already exists in database',
        migrated: false
      });
    }
    
    // Add columns if they don't exist
    const migrations = [];
    
    if (!columnNames.includes('ban_type')) {
      await db.query(`
        ALTER TABLE \`bans\` 
        ADD COLUMN \`ban_type\` VARCHAR(20) DEFAULT 'player' AFTER \`id\`,
        ADD INDEX \`idx_ban_type\` (\`ban_type\`)
      `);
      migrations.push('Added ban_type column');
    }
    
    if (!columnNames.includes('ip_address')) {
      await db.query(`
        ALTER TABLE \`bans\` 
        ADD COLUMN \`ip_address\` VARCHAR(45) NULL AFTER \`player_uuid\`,
        ADD INDEX \`idx_ip_address\` (\`ip_address\`)
      `);
      migrations.push('Added ip_address column');
    }
    
    // Update existing bans to have ban_type = 'player'
    await db.query("UPDATE `bans` SET `ban_type` = 'player' WHERE `ban_type` IS NULL");
    migrations.push('Updated existing bans to player type');
    
    res.json({ 
      success: true, 
      message: 'Migration completed successfully',
      migrations,
      migrated: true
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;


