const express = require('express');
const router = express.Router();
const { getDB } = require('../database');
const { getServerStatus } = require('../utils/minecraftQuery');
const db = getDB();

// GET / - Homepage
router.get('/', async (req, res) => {
  try {
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");

    // Get latest news
    const news = await db.fetchAll("SELECT * FROM news ORDER BY created_at DESC LIMIT 5");

    // Get server rules
    const rules = await db.fetchAll(`
      SELECT r.*, c.name as category_name, c.color as category_color
      FROM rules r
      LEFT JOIN rule_categories c ON r.category_id = c.id
      ORDER BY c.sort_order ASC, r.sort_order ASC
    `);

    // Get features
    const features = await db.fetchAll(`
      SELECT * FROM features
      WHERE active = 1
      ORDER BY sort_order ASC
    `);

    // Get store items
    const storeItems = await db.fetchAll(`
      SELECT si.*, sc.name as category_name
      FROM store_items si
      LEFT JOIN store_categories sc ON si.category_id = sc.id
      WHERE si.active = 1
      ORDER BY sc.sort_order ASC, si.sort_order ASC
      LIMIT 8
    `);

    // Get top players
    const topPlayers = await db.fetchAll(`
      SELECT username, join_count, last_seen
      FROM players
      ORDER BY join_count DESC
      LIMIT 10
    `);

    // Get active bans for wall of shame
    const wallOfShame = await db.fetchAll(`
      SELECT b.player_username, b.reason, b.created_at, b.expires_at
      FROM bans b
      WHERE b.active = 1 AND b.expires_at > NOW()
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // Get wall of fame entries
    const wallOfFame = await db.fetchAll(`
      SELECT * FROM wall_of_fame
      WHERE featured = 1
      ORDER BY created_at DESC
      LIMIT 3
    `);

    // Get notifications
    const notifications = await db.fetchAll(`
      SELECT * FROM notifications
      WHERE active = 1 AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 3
    `);

    // Get changelog entries
    const changelogEntries = await db.fetchAll(`
      SELECT id, version, title, description, release_date, is_major
      FROM changelog
      ORDER BY release_date DESC
      LIMIT 5
    `);

    // Get stats
    const statsResult = await db.fetchOne(`
      SELECT
        (SELECT COUNT(*) FROM players) as total_players,
        (SELECT COUNT(*) FROM bans WHERE active = 1) as total_bans
    `);
    const stats = {
      total_players: statsResult ? statsResult.total_players || 0 : 0,
      total_bans: statsResult ? statsResult.total_bans || 0 : 0,
      online_now: 0 // Will be set from server status if available
    };

    let serverStatus = null;
    if (serverSettings) {
      try {
        serverStatus = await getServerStatus();
        if (serverStatus && serverStatus.online && serverStatus.players) {
          stats.online_now = serverStatus.players.online || 0;
        }
      } catch (error) {
        serverStatus = { online: false, error: 'Query failed' };
      }
    }

    res.render('index', {
      serverSettings,
      serverStatus,
      news,
      rules,
      storeItems,
      topPlayers,
      wallOfShame,
      wallOfFame,
      notifications,
      changelogEntries,
      stats,
      features
    });
  } catch (error) {
    console.error('Homepage error:', error);
    res.render('index', {
      serverSettings: null,
      serverStatus: null,
      news: [],
      rules: [],
      storeItems: [],
      topPlayers: [],
      wallOfShame: [],
      wallOfFame: [],
      notifications: [],
      changelogEntries: [],
      stats: {
        total_players: 0,
        total_bans: 0,
        online_now: 0
      },
      features: []
    });
  }
});

// GET /status - Server status page
router.get('/status', async (req, res) => {
  try {
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");

    let serverStatus = null;
    let incidents = [];

    if (serverSettings) {
      try {
        serverStatus = await getServerStatus();
      } catch (error) {
        serverStatus = { online: false, error: 'Query failed' };
      }

      // Get recent incidents (you can create an incidents table later)
      incidents = await db.fetchAll(`
        SELECT * FROM server_incidents
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY created_at DESC
        LIMIT 10
      `);
    }

    res.render('status', {
      serverSettings,
      serverStatus,
      incidents
    });
  } catch (error) {
    console.error('Status page error:', error);
    res.render('status', {
      serverSettings: null,
      serverStatus: null,
      incidents: []
    });
  }
});

// GET /shop - Store page
router.get('/shop', async (req, res) => {
  try {
    const categories = await db.fetchAll("SELECT * FROM store_categories ORDER BY sort_order ASC");

    const items = await db.fetchAll(`
      SELECT si.*, sc.name as category_name, sc.icon as category_icon
      FROM store_items si
      LEFT JOIN store_categories sc ON si.category_id = sc.id
      WHERE si.active = 1
      ORDER BY sc.sort_order ASC, si.sort_order ASC
    `);

    res.render('shop', {
      categories,
      items
    });
  } catch (error) {
    console.error('Shop page error:', error);
    res.render('shop', {
      categories: [],
      items: []
    });
  }
});

// GET /register - Registration page
router.get('/register', (req, res) => {
  res.render('register', {
    error: req.query.error,
    success: req.query.success
  });
});

// POST /register - Handle registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirm_password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.render('register', {
        error: 'All fields are required',
        username, email
      });
    }

    if (password !== confirm_password) {
      return res.render('register', {
        error: 'Passwords do not match',
        username, email
      });
    }

    if (password.length < 6) {
      return res.render('register', {
        error: 'Password must be at least 6 characters',
        username, email
      });
    }

    // Check if username or email already exists
    const existingUser = await db.fetchOne(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser) {
      return res.render('register', {
        error: 'Username or email already exists',
        username, email
      });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query(
      "INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, 'user', NOW())",
      [username, email, hashedPassword]
    );

    res.redirect('/register?success=Registration successful! You can now log in.');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', {
      error: 'Registration failed. Please try again.',
      username: req.body.username,
      email: req.body.email
    });
  }
});

// GET /vote - Voting page
router.get('/vote', async (req, res) => {
  try {
    const votingSites = await db.fetchAll("SELECT * FROM voting_sites WHERE active = 1 ORDER BY sort_order ASC");

    res.render('vote', {
      votingSites
    });
  } catch (error) {
    console.error('Vote page error:', error);
    res.render('vote', {
      votingSites: []
    });
  }
});

// GET /leaderboard - Leaderboard page
router.get('/leaderboard', async (req, res) => {
  try {
    const players = await db.fetchAll(`
      SELECT username, join_count, first_seen, last_seen
      FROM players
      ORDER BY join_count DESC
      LIMIT 50
    `);

    res.render('leaderboard', {
      players
    });
  } catch (error) {
    console.error('Leaderboard page error:', error);
    res.render('leaderboard', {
      players: []
    });
  }
});

// GET /changelog - Public changelog page
router.get('/changelog', async (req, res) => {
  try {
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Get changelog entries
    const entries = await db.fetchAll(`
      SELECT id, version, title, description, release_date, is_major, created_at
      FROM changelog
      ORDER BY release_date DESC, created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Get total count
    const countResult = await db.fetchOne('SELECT COUNT(*) as total FROM changelog');
    const total = countResult ? countResult.total : 0;
    const totalPages = Math.ceil(total / limit);

    // Get stats
    const statsResult = await db.fetchOne(`
      SELECT
        COUNT(*) as total_entries,
        SUM(CASE WHEN is_major = 1 THEN 1 ELSE 0 END) as major_releases,
        MAX(release_date) as latest_release
      FROM changelog
    `);
    const stats = statsResult || { total_entries: 0, major_releases: 0, latest_release: null };

    res.render('changelog', {
      serverSettings,
      entries,
      currentPage: page,
      totalPages,
      total,
      stats
    });
  } catch (error) {
    console.error('Changelog page error:', error);
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1").catch(() => null);
    res.render('changelog', {
      serverSettings,
      entries: [],
      currentPage: 1,
      totalPages: 1,
      total: 0,
      stats: { total_entries: 0, major_releases: 0, latest_release: null }
    });
  }
});

// GET /blog - Blog listing page
router.get('/blog', async (req, res) => {
  try {
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const tag = req.query.tag;

    let whereClause = "WHERE p.status = 'published'";
    let params = [limit, offset];

    if (category) {
      whereClause += " AND p.category_id = ?";
      params.unshift(category);
    }

    if (tag) {
      whereClause += " AND EXISTS (SELECT 1 FROM blog_post_tags pt WHERE pt.post_id = p.id AND pt.tag_id = ?)";
      params.unshift(tag);
    }

    // Get posts
    const posts = await db.fetchAll(`
      SELECT p.*, c.name as category_name, c.color as category_color, c.slug as category_slug,
             u.username as author_name, COUNT(cm.id) as comment_count
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN blog_comments cm ON p.id = cm.post_id AND cm.status = 'approved'
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.published_at DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `, params);

    // Get total count
    const countResult = await db.fetchOne(`
      SELECT COUNT(DISTINCT p.id) as total FROM blog_posts p ${whereClause.replace('GROUP BY p.id', '')}
    `, params.slice(2));
    const total = countResult ? countResult.total : 0;
    const totalPages = Math.ceil(total / limit);

    // Get categories
    const categories = await db.fetchAll('SELECT id, name, slug, color FROM blog_categories WHERE active = 1 ORDER BY sort_order');

    // Get popular tags
    const tags = await db.fetchAll(`
      SELECT t.id, t.name, t.slug, t.color, COUNT(pt.post_id) as post_count
      FROM blog_tags t
      LEFT JOIN blog_post_tags pt ON t.id = pt.tag_id
      LEFT JOIN blog_posts p ON pt.post_id = p.id AND p.status = 'published'
      GROUP BY t.id
      HAVING post_count > 0
      ORDER BY post_count DESC
      LIMIT 20
    `);

    // Get recent posts for sidebar
    const recentPosts = await db.fetchAll(`
      SELECT id, title, slug, published_at
      FROM blog_posts
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 5
    `);

    res.render('blog', {
      serverSettings,
      posts,
      categories,
      tags,
      recentPosts,
      currentPage: page,
      totalPages,
      total,
      filters: { category, tag },
      pageTitle: 'Blog',
      pageDescription: 'Latest news, updates, and stories from our community'
    });
  } catch (error) {
    console.error('Blog page error:', error);
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1").catch(() => null);
    res.render('blog', {
      serverSettings,
      posts: [],
      categories: [],
      tags: [],
      recentPosts: [],
      currentPage: 1,
      totalPages: 1,
      total: 0,
      filters: {},
      pageTitle: 'Blog',
      pageDescription: 'Latest news, updates, and stories from our community'
    });
  }
});

// GET /blog/:slug - Individual blog post
router.get('/blog/:slug', async (req, res) => {
  try {
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
    const posts = await db.fetchAll(`
      SELECT p.*, c.name as category_name, c.color as category_color, c.slug as category_slug,
             u.username as author_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = ? AND p.status = 'published'
    `, [req.params.slug]);

    if (posts.length === 0) {
      return res.status(404).render('error', { error: 'Blog post not found', serverSettings });
    }

    const post = posts[0];

    // Increment view count
    await db.query('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [post.id]);

    // Get tags
    const tags = await db.fetchAll(`
      SELECT t.id, t.name, t.slug, t.color
      FROM blog_tags t
      INNER JOIN blog_post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
      ORDER BY t.name
    `, [post.id]);

    // Get comments
    const comments = await db.fetchAll(`
      SELECT c.*, p.slug as post_slug
      FROM blog_comments c
      LEFT JOIN blog_posts p ON c.post_id = p.id
      WHERE c.post_id = ? AND c.status = 'approved' AND c.parent_id IS NULL
      ORDER BY c.created_at ASC
    `, [post.id]);

    // Get replies for each comment
    for (const comment of comments) {
      const replies = await db.fetchAll(`
        SELECT c.*, p.slug as post_slug
        FROM blog_comments c
        LEFT JOIN blog_posts p ON c.post_id = p.id
        WHERE c.parent_id = ? AND c.status = 'approved'
        ORDER BY c.created_at ASC
      `, [comment.id]);
      comment.replies = replies;
    }

    // Get related posts
    const relatedPosts = await db.fetchAll(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image, p.published_at
      FROM blog_posts p
      WHERE p.id != ? AND p.status = 'published' AND (
        p.category_id = ? OR
        EXISTS (
          SELECT 1 FROM blog_post_tags pt1
          INNER JOIN blog_post_tags pt2 ON pt1.tag_id = pt2.tag_id
          WHERE pt1.post_id = ? AND pt2.post_id = p.id
        )
      )
      GROUP BY p.id
      ORDER BY p.published_at DESC
      LIMIT 3
    `, [post.id, post.category_id, post.id]);

    res.render('blog-post', {
      serverSettings,
      post,
      tags,
      comments,
      relatedPosts,
      pageTitle: post.seo_title || post.title,
      pageDescription: post.seo_description || post.excerpt
    });
  } catch (error) {
    console.error('Blog post error:', error);
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1").catch(() => null);
    res.status(500).render('error', { error: 'Failed to load blog post', serverSettings });
  }
});

// POST /blog/:slug/comment - Add comment to post
router.post('/blog/:slug/comment', async (req, res) => {
  try {
    const { author_name, author_email, content, parent_id } = req.body;

    // Get post
    const posts = await db.fetchAll('SELECT id, comments_enabled FROM blog_posts WHERE slug = ?', [req.params.slug]);
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];
    if (!post.comments_enabled) {
      return res.status(400).json({ error: 'Comments are disabled for this post' });
    }

    // Validate input
    if (!author_name || !content) {
      return res.status(400).json({ error: 'Name and comment are required' });
    }

    if (author_name.length > 100 || content.length > 2000) {
      return res.status(400).json({ error: 'Input too long' });
    }

    // Insert comment
    await db.query(`
      INSERT INTO blog_comments (post_id, author_name, author_email, content, status, parent_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
    `, [
      post.id,
      author_name,
      author_email || null,
      content,
      parent_id || null,
      req.ip,
      req.get('User-Agent')
    ]);

    res.json({ success: true, message: 'Comment submitted for moderation' });
  } catch (error) {
    console.error('Comment submission error:', error);
    res.status(500).json({ error: 'Failed to submit comment' });
  }
});

// GET /blog/category/:slug - Posts by category
router.get('/blog/category/:slug', async (req, res) => {
  try {
    const categories = await db.fetchAll('SELECT id, name FROM blog_categories WHERE slug = ? AND active = 1', [req.params.slug]);
    if (categories.length === 0) {
      const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1").catch(() => null);
      return res.status(404).render('error', { error: 'Category not found', serverSettings });
    }

    const category = categories[0];
    req.query.category = category.id;
    req.url = '/blog'; // Redirect to main blog page with category filter
    router.handle(req, res);
  } catch (error) {
    console.error('Category page error:', error);
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1").catch(() => null);
    res.status(500).render('error', { error: 'Failed to load category', serverSettings });
  }
});

// GET /blog/tag/:slug - Posts by tag
router.get('/blog/tag/:slug', async (req, res) => {
  try {
    const tags = await db.fetchAll('SELECT id, name FROM blog_tags WHERE slug = ?', [req.params.slug]);
    if (tags.length === 0) {
      const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1").catch(() => null);
      return res.status(404).render('error', { error: 'Tag not found', serverSettings });
    }

    const tag = tags[0];
    req.query.tag = tag.id;
    req.url = '/blog'; // Redirect to main blog page with tag filter
    router.handle(req, res);
  } catch (error) {
    console.error('Tag page error:', error);
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1").catch(() => null);
    res.status(500).render('error', { error: 'Failed to load tag', serverSettings });
  }
});

module.exports = router;