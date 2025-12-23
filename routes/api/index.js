const express = require('express');
const router = express.Router();
const cors = require('cors');

// CORS middleware
router.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

router.use(express.json());

// API authentication middleware (simplified)
router.use(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-api-key'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing authentication' });
  }
  
  // Simple token validation (you'd implement proper API key validation)
  req.user = { authenticated: true };
  next();
});

// API endpoints
router.use('/news', require('./endpoints/news'));
router.use('/players', require('./endpoints/players'));
router.use('/bans', require('./endpoints/bans'));
router.use('/server', require('./endpoints/server'));
router.use('/stats', require('./endpoints/stats'));

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    api: 'Minecraft Server CMS API v1',
    endpoints: {
      '/api/v1/news': 'GET, POST - News articles',
      '/api/v1/players': 'GET - Player list',
      '/api/v1/bans': 'GET - Ban list',
      '/api/v1/server': 'GET - Server status',
      '/api/v1/stats': 'GET - Statistics'
    },
    authentication: 'Bearer token or X-API-Key header'
  });
});

module.exports = router;


