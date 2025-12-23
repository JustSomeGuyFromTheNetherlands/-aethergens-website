const express = require('express');
const router = express.Router();
const { requireAuth, getCurrentAdmin, logout } = require('../middleware/auth');
const { getDB } = require('../database');
const { getServerStatus } = require('../utils/minecraftQuery');
const { setCSPHeaders } = require('../middleware/security');

// Login page
router.get('/login', (req, res) => {
  res.render('admin/login', { error: req.query.error });
});

router.post('/login', async (req, res) => {
  const { login } = require('../middleware/auth');
  const { username, password } = req.body;
  
  try {
    const result = await login(req, username, password);
    if (result) {
      res.redirect('/admin');
    } else {
      res.redirect('/admin/login?error=Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/admin/login?error=Login failed');
  }
});

// Logout
router.get('/logout', (req, res) => {
  logout(req);
  res.redirect('/admin/login');
});

// Protect all admin routes
router.use(requireAuth);
router.use(setCSPHeaders);
const { adminLayout } = require('../middleware/adminLayout');
router.use(adminLayout);

// Admin dashboard
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const currentAdmin = getCurrentAdmin(req);
    
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    const totalPlayers = (await db.fetchOne("SELECT COUNT(*) as count FROM players"))?.count || 0;
    const totalBans = (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE active = 1"))?.count || 0;
    const pendingAppeals = (await db.fetchOne("SELECT COUNT(*) as count FROM appeals WHERE status = 'pending'"))?.count || 0;
    const pendingApplications = (await db.fetchOne("SELECT COUNT(*) as count FROM applications_pending WHERE status = 'pending'"))?.count || 0;
    const recentNews = await db.fetchAll("SELECT * FROM news ORDER BY created_at DESC LIMIT 5");
    const recentLogs = await db.fetchAll("SELECT * FROM admin_log ORDER BY timestamp DESC LIMIT 10");
    
    let serverStatus = null;
    if (serverSettings) {
      try {
        serverStatus = await getServerStatus();
      } catch (error) {
        serverStatus = { online: false, error: 'Query failed' };
      }
    }
    
    // Get player growth data
    const playerGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = (await db.fetchOne(
        "SELECT COUNT(*) as count FROM players WHERE DATE(first_seen) <= ?",
        [dateStr]
      ))?.count || 0;
      playerGrowth.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }
    
    res.render('admin/index', {
      pageName: 'index',
      pageTitle: 'Dashboard',
      pageSubtitle: serverSettings ? `Server: ${serverSettings.server_name}` : 'Server: Not configured',
      currentAdmin,
      serverSettings,
      totalPlayers,
      totalBans,
      pendingAppeals,
      pendingApplications,
      recentNews,
      recentLogs,
      serverStatus,
      playerGrowth
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// AJAX server status
router.get('/ajax/server_status', async (req, res) => {
  try {
    const status = await getServerStatus();
    res.json(status);
  } catch (error) {
    res.json({ online: false, error: 'Query failed: ' + error.message });
  }
});

// Admin sub-routes
router.use('/bans', require('./admin/bans'));
router.use('/news', require('./admin/news'));
router.use('/players', require('./admin/players'));
router.use('/appeals', require('./admin/appeals'));
router.use('/applications', require('./admin/applications'));
router.use('/settings', require('./admin/settings'));
router.use('/features', require('./admin/features'));
router.use('/rules', require('./admin/rules'));
router.use('/webhooks', require('./admin/webhooks'));
router.use('/users', require('./admin/users'));
router.use('/console', require('./admin/console'));
router.use('/store', require('./admin/store'));
router.use('/notifications', require('./admin/notifications'));
router.use('/api-key', require('./admin/api-key'));
router.use('/analytics', require('./admin/analytics'));
router.use('/backups', require('./admin/backups'));
router.use('/files', require('./admin/files'));
router.use('/logs', require('./admin/logs'));
router.use('/social-links', require('./admin/social-links').router);
router.use('/wall-of-fame', require('./admin/wall-of-fame'));
router.use('/player', require('./admin/player-detail'));

// Database migrations
router.use('/database/migrate', require('../routes/database/migrate'));

module.exports = router;

