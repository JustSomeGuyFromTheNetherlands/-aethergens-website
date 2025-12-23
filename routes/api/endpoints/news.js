const express = require('express');
const router = express.Router();
const { getDB } = require('../../../database');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const news = await db.fetchAll("SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC");
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


