const express = require('express');
const router = express.Router();
const { getServerStatus } = require('../../../utils/minecraftQuery');

router.get('/', async (req, res) => {
  try {
    const status = await getServerStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

