const express = require('express');
const router = express.Router();
const { searchAll } = require('../../utils/search');

router.get('/', async (req, res) => {
    try {
        const query = req.query.q || '';
        const results = await searchAll(query, 10);
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;

