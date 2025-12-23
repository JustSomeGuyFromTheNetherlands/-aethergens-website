const express = require('express');
const router = express.Router();
const { getDB } = require('../../../database');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    
    let query = "SELECT * FROM players";
    const params = [];
    
    if (search) {
      query += " WHERE username LIKE ?";
      params.push(`%${search}%`);
    }
    
    query += " ORDER BY last_seen DESC LIMIT ?";
    params.push(limit);
    
    const players = await db.fetchAll(query, params);
    res.json({ success: true, data: players });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    
    const player = await db.fetchOne(
      "SELECT * FROM players WHERE id = ? OR username = ?",
      [parseInt(id) || 0, id]
    );
    
    if (player) {
      res.json({ success: true, data: player });
    } else {
      res.status(404).json({ error: 'Not Found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

