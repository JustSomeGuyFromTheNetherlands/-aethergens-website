const express = require('express');
const router = express.Router();
const { getDB } = require('../database');
const { getServerStatus } = require('../utils/minecraftQuery');
const { updatePlayersAuto } = require('../utils/playerTracker');
const { setCSPHeaders } = require('../middleware/security');

// Auto-update players (rate limited) - skip if tables don't exist
router.use(async (req, res, next) => {
  try {
    await updatePlayersAuto();
  } catch (error) {
    // Ignore errors if tables don't exist yet
    if (!error.message.includes("doesn't exist") && !error.message.includes("Unknown table")) {
      console.error('Player tracker error:', error.message);
    }
  }
  next();
});

// Handle AJAX request for server status
router.get('/ajax/server_status', async (req, res) => {
  try {
    const db = getDB();
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    if (serverSettings) {
      const status = await getServerStatus();
      res.json(status);
    } else {
      res.json({ online: false, error: 'Server not configured' });
    }
  } catch (error) {
    res.json({ online: false, error: 'Query failed: ' + error.message });
  }
});

// Main index page
router.get('/', setCSPHeaders, async (req, res) => {
  try {
    const db = getDB();
    
    // Check if tables exist
    let serverSettings;
    try {
      serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    } catch (error) {
      // Table doesn't exist - show installation page
      if (error.message.includes("doesn't exist") || error.message.includes("Unknown table") || error.code === 'ER_NO_SUCH_TABLE') {
        return res.render('install', { 
          message: 'Database tables not found. Please run the installation script.',
          error: error.message
        });
      }
      throw error;
    }
    
    if (!serverSettings) {
      return res.render('install', { 
        message: 'Database tables not found. Please run the installation script.',
        error: 'Table server_settings does not exist'
      });
    }
    
    serverSettings = serverSettings || {
      server_name: 'Minecraft Server',
      server_ip: 'play.example.com',
      server_port: 25565,
      status_message: 'Server Online',
      maintenance_mode: 0
    };
    
    // Get features, news, rules, store items
    const features = await db.fetchAll("SELECT * FROM features ORDER BY order_index ASC LIMIT 8").catch(() => []);
    const news = await db.fetchAll("SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC LIMIT 5").catch(() => []);
    
    const rulesRaw = await db.fetchAll("SELECT category, rule_text FROM rules ORDER BY category, order_index").catch(() => []);
    const rules = {};
    rulesRaw.forEach(rule => {
      if (!rules[rule.category]) {
        rules[rule.category] = { category: rule.category, rules: [] };
      }
      rules[rule.category].rules.push(rule.rule_text);
    });
    const rulesArray = Object.values(rules);
    
    const storeItems = await db.fetchAll(
      `SELECT si.*, sc.name as category_name 
       FROM store_items si 
       LEFT JOIN store_categories sc ON si.category_id = sc.id 
       WHERE si.active = 1 
       ORDER BY si.featured DESC, si.created_at DESC 
       LIMIT 6`
    ).catch(() => []);
    
    // Get stats
    const stats = {
      total_players: (await db.fetchOne("SELECT COUNT(*) as count FROM players").catch(() => ({ count: 0 })))?.count || 0,
      online_now: (await db.fetchOne("SELECT COUNT(*) as count FROM players WHERE last_seen > DATE_SUB(NOW(), INTERVAL 1 HOUR)").catch(() => ({ count: 0 })))?.count || 0,
      total_bans: (await db.fetchOne("SELECT COUNT(*) as count FROM bans WHERE active = 1").catch(() => ({ count: 0 })))?.count || 0
    };
    
    // Get top players
    const topPlayers = await db.fetchAll(
      "SELECT username, join_count, last_seen FROM players ORDER BY join_count DESC, last_seen DESC LIMIT 10"
    ).catch(() => []);
    
    // Get wall of fame (featured entries, or all if none featured)
    let wallOfFame = [];
    try {
      // First try to get featured entries
      wallOfFame = await db.fetchAll(
        `SELECT wof.*, p.playtime, p.join_count, p.total_kills, p.level, p.balance
         FROM wall_of_fame wof
         LEFT JOIN players p ON wof.player_username = p.username
         WHERE wof.featured = 1
         ORDER BY wof.created_at DESC
         LIMIT 12`
      );
      
      // If no featured entries, get all entries
      if (!wallOfFame || wallOfFame.length === 0) {
        wallOfFame = await db.fetchAll(
          `SELECT wof.*, p.playtime, p.join_count, p.total_kills, p.level, p.balance
           FROM wall_of_fame wof
           LEFT JOIN players p ON wof.player_username = p.username
           ORDER BY wof.created_at DESC
           LIMIT 12`
        );
      }
    } catch (error) {
      // Table might not exist yet, that's okay
      console.error('Wall of Fame query error:', error.message);
      wallOfFame = [];
    }
    
    // Get wall of shame
    const wallOfShame = await db.fetchAll(
      "SELECT player_username, player_uuid, banned_by, reason, ban_date, expires_at FROM bans WHERE active = 1 ORDER BY ban_date DESC"
    ).catch(() => []);
    
    // Get notifications
    const notifications = await db.fetchAll(
      `SELECT * FROM notifications 
       WHERE active = 1 
       AND (start_date IS NULL OR start_date <= NOW()) 
       AND (end_date IS NULL OR end_date >= NOW()) 
       ORDER BY 
         CASE priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'normal' THEN 3
           WHEN 'low' THEN 4
         END ASC, created_at DESC`
    ).catch(() => []);
    
    // Get server status
    let serverStatus = null;
    if (serverSettings) {
      try {
        serverStatus = await getServerStatus();
      } catch (error) {
        serverStatus = { online: false, error: 'Query failed' };
      }
    }
    
    res.render('index', {
      serverSettings,
      features,
      news,
      rules: rulesArray,
      storeItems,
      stats,
      topPlayers,
      wallOfShame,
      wallOfFame,
      notifications,
      serverStatus
    });
  } catch (error) {
    console.error('Index page error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Public sub-routes
router.use('/public/appeal', require('./public/appeal'));
router.use('/public/apply', require('./public/apply'));

// Other public routes
router.get('/vote', (req, res) => res.render('vote'));
router.get('/leaderboard', async (req, res) => {
  try {
    const db = getDB();
    const players = await db.fetchAll(
      "SELECT username, join_count, last_seen FROM players ORDER BY join_count DESC, last_seen DESC LIMIT 100"
    );
    res.render('leaderboard', { players });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});
// Status page
router.get('/status', setCSPHeaders, async (req, res) => {
  try {
    const db = getDB();
    
    // Get server settings
    let serverSettings;
    try {
      serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    } catch (error) {
      serverSettings = { server_name: 'Minecraft Server' };
    }
    
    serverSettings = serverSettings || { server_name: 'Minecraft Server' };
    
    // Get all notifications (including past ones)
    let allNotifications = [];
    try {
      allNotifications = await db.fetchAll("SELECT * FROM notifications ORDER BY created_at DESC");
      if (!Array.isArray(allNotifications)) {
        allNotifications = [];
      }
    } catch (error) {
      allNotifications = [];
    }
    
    // Separate active and past incidents
    const activeIncidents = [];
    const pastIncidents = [];
    const currentTime = Date.now();
    
    allNotifications.forEach(notif => {
      const isActive = notif.active == 1;
      const started = !notif.start_date || new Date(notif.start_date).getTime() <= currentTime;
      const notEnded = !notif.end_date || new Date(notif.end_date).getTime() >= currentTime;
      
      if (isActive && started && notEnded) {
        activeIncidents.push(notif);
      } else {
        pastIncidents.push(notif);
      }
    });
    
    // Get current server status
    let serverStatus = null;
    if (serverSettings) {
      try {
        serverStatus = await getServerStatus();
      } catch (error) {
        serverStatus = { online: false, error: 'Query failed: ' + error.message };
      }
    }
    
    res.render('status', {
      serverSettings,
      activeIncidents,
      pastIncidents,
      serverStatus
    });
  } catch (error) {
    console.error('Status page error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Shop page
router.get('/shop', setCSPHeaders, async (req, res) => {
  try {
    const db = getDB();
    
    // Get server settings
    let serverSettings;
    try {
      serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    } catch (error) {
      serverSettings = { server_name: 'Minecraft Server' };
    }
    
    serverSettings = serverSettings || {
      server_name: 'Minecraft Server',
      server_ip: 'play.example.com',
      server_port: 25565
    };
    
    // Get shop categories and items from database
    let shopCategories = [];
    try {
      const categories = await db.fetchAll("SELECT * FROM store_categories ORDER BY order_index ASC");
      const items = await db.fetchAll("SELECT * FROM store_items WHERE active = 1 ORDER BY featured DESC, created_at DESC");
      
      // Group items by category
      shopCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || 'fas fa-box',
        color: 'purple',
        items: items.filter(item => item.category_id == cat.id).map(item => ({
          name: item.name,
          price: parseFloat(item.price),
          description: item.description || '',
          features: item.description ? item.description.split('\n').filter(f => f.trim()) : [],
          image: item.icon_url || 'https://via.placeholder.com/300x200/667eea/ffffff?text=' + encodeURIComponent(item.name)
        }))
      }));
      
      // Add uncategorized items
      const uncategorizedItems = items.filter(item => !item.category_id);
      if (uncategorizedItems.length > 0) {
        shopCategories.push({
          id: null,
          name: 'Other',
          icon: 'fas fa-box',
          color: 'slate',
          items: uncategorizedItems.map(item => ({
            name: item.name,
            price: parseFloat(item.price),
            description: item.description || '',
            features: item.description ? item.description.split('\n').filter(f => f.trim()) : [],
            image: item.icon_url || 'https://via.placeholder.com/300x200/667eea/ffffff?text=' + encodeURIComponent(item.name)
          }))
        });
      }
    } catch (error) {
      console.error('Shop page error:', error);
      // Use default categories if database fails
      shopCategories = [];
    }
    
    res.render('shop', {
      serverSettings,
      shopCategories,
      message: req.query.message || ''
    });
  } catch (error) {
    console.error('Shop page error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Handle shop purchase
router.post('/shop', setCSPHeaders, async (req, res) => {
  try {
    const { item_name, price } = req.body;
    
    // In real implementation, redirect to payment processor
    res.redirect('/shop?message=' + encodeURIComponent(`Redirecting to payment for ${item_name} ($${price})...`));
  } catch (error) {
    console.error('Shop purchase error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Register page
router.get('/register', setCSPHeaders, async (req, res) => {
  try {
    const db = getDB();
    
    // Get server settings
    let serverSettings;
    try {
      serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    } catch (error) {
      serverSettings = { server_name: 'Minecraft Server' };
    }
    
    serverSettings = serverSettings || {
      server_name: 'Minecraft Server',
      server_ip: 'play.example.com',
      server_port: 25565
    };
    
    res.render('register', {
      serverSettings,
      message: '',
      error: '',
      success: false
    });
  } catch (error) {
    console.error('Register page error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Handle registration
router.post('/register', setCSPHeaders, async (req, res) => {
  try {
    const db = getDB();
    const bcrypt = require('bcrypt');
    
    // Get server settings
    let serverSettings;
    try {
      serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    } catch (error) {
      serverSettings = { server_name: 'Minecraft Server' };
    }
    
    serverSettings = serverSettings || {
      server_name: 'Minecraft Server',
      server_ip: 'play.example.com',
      server_port: 25565
    };
    
    const { username, email, password, confirm_password, minecraft_username } = req.body;
    
    const errors = [];
    
    // Validate input
    if (!username || username.trim().length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email address is required');
    }
    
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (password !== confirm_password) {
      errors.push('Passwords do not match');
    }
    
    if (!minecraft_username || !/^[a-zA-Z0-9_]{1,16}$/.test(minecraft_username)) {
      errors.push('Valid Minecraft username is required (1-16 characters, letters/numbers/underscores)');
    }
    
    if (errors.length === 0) {
      // Check if user already exists
      const existingUser = await db.fetchOne("SELECT id FROM users WHERE username = ? OR email = ?", [username, email]);
      if (existingUser) {
        errors.push('Username or email already exists');
      } else {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Insert user
        await db.insert('users', {
          username: username.trim(),
          email: email.trim(),
          password_hash: passwordHash,
          role: 'user',
          active: 1,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        return res.render('register', {
          serverSettings,
          message: 'Registration successful! You can now log in.',
          error: '',
          success: true
        });
      }
    }
    
    res.render('register', {
      serverSettings,
      message: '',
      error: errors.join('<br>'),
      success: false
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Enhanced vote page
router.get('/vote', setCSPHeaders, async (req, res) => {
  try {
    const db = getDB();
    
    // Get server settings
    let serverSettings;
    try {
      serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    } catch (error) {
      serverSettings = { server_name: 'Minecraft Server' };
    }
    
    serverSettings = serverSettings || {
      server_name: 'Minecraft Server',
      server_ip: 'play.example.com',
      server_port: 25565
    };
    
    // Voting sites (could be stored in database, but using hardcoded for now)
    const votingSites = [
      {
        name: 'Minecraft Server List',
        url: 'https://minecraft-server-list.com/server/123456/vote/',
        image: 'https://minecraft-server-list.com/favicon.ico',
        cooldown: 24,
        reward: '1 Vote Key'
      },
      {
        name: 'Top Minecraft Servers',
        url: 'https://topminecraftservers.org/vote/123456',
        image: 'https://topminecraftservers.org/favicon.ico',
        cooldown: 24,
        reward: '1 Vote Key'
      },
      {
        name: 'Minecraft Servers',
        url: 'https://minecraftservers.org/vote/123456',
        image: 'https://minecraftservers.org/favicon.ico',
        cooldown: 24,
        reward: '1 Vote Key'
      },
      {
        name: 'Planet Minecraft',
        url: 'https://www.planetminecraft.com/server/example/vote/',
        image: 'https://www.planetminecraft.com/favicon.ico',
        cooldown: 24,
        reward: '2 Vote Keys'
      }
    ];
    
    // Handle vote callback
    let message = '';
    if (req.query.site !== undefined && req.query.callback) {
      const siteId = parseInt(req.query.site);
      if (votingSites[siteId]) {
        message = `Vote recorded! You received a ${votingSites[siteId].reward}`;
      }
    }
    
    // Get user's vote history (demo - in real implementation, check cooldown)
    const userVotes = votingSites.map(() => ({
      canVote: true,
      lastVote: null,
      nextVote: null
    }));
    
    // Get vote statistics (demo - in real implementation, query database)
    const voteStats = {
      totalVotes: 1247,
      uniqueVoters: 89,
      rewardsGiven: 156
    };
    
    // Top voters (demo - in real implementation, query database)
    const topVoters = [
      { name: 'Player1', votes: 25, rank: 1 },
      { name: 'Player2', votes: 22, rank: 2 },
      { name: 'Player3', votes: 19, rank: 3 },
      { name: 'Player4', votes: 17, rank: 4 },
      { name: 'Player5', votes: 15, rank: 5 }
    ];
    
    res.render('vote', {
      serverSettings,
      votingSites,
      userVotes,
      message,
      voteStats,
      topVoters
    });
  } catch (error) {
    console.error('Vote page error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Enhanced leaderboard page
router.get('/leaderboard', setCSPHeaders, async (req, res) => {
  try {
    const db = getDB();
    
    // Get server settings
    let serverSettings;
    try {
      serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    } catch (error) {
      serverSettings = { server_name: 'Minecraft Server' };
    }
    
    serverSettings = serverSettings || {
      server_name: 'Minecraft Server',
      server_ip: 'play.example.com',
      server_port: 25565
    };
    
    let players = [];
    try {
      players = await db.fetchAll(
        "SELECT username, join_count, last_seen FROM players ORDER BY join_count DESC, last_seen DESC LIMIT 100"
      );
    } catch (error) {
      console.error('Leaderboard error:', error);
      players = [];
    }
    
    res.render('leaderboard', {
      serverSettings,
      players
    });
  } catch (error) {
    console.error('Leaderboard page error:', error);
    res.status(500).render('error', { error: error.message });
  }
});

module.exports = router;

