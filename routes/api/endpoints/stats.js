const express = require('express');
const router = express.Router();
const { getDB } = require('../../../database');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    
    const stats = {
      total_players: (await db.fetchOne("SELECT COUNT(*) as count FROM players"))?.count || 0,
      online_now: (await db.fetchOne("SELECT COUNT(*) as count FROM players WHERE last_seen > DATE_SUB(NOW(), INTERVAL 1 HOUR)"))?.count || 0,
      total_bans: (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE active = 1"))?.count || 0,
      pending_appeals: (await db.fetchOne("SELECT COUNT(*) as count FROM appeals WHERE status = 'pending'"))?.count || 0
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


