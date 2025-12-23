const express = require('express');
const router = express.Router();
const { getDB } = require('../../../database');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const bans = await db.fetchAll("SELECT * FROM bans WHERE active = 1 ORDER BY ban_date DESC");
    res.json({ success: true, data: bans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

