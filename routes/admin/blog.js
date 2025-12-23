const express = require('express');
const router = express.Router();
const db = require('../../database');
const { requireAuth } = require('../../middleware/auth');
const { adminLayout } = require('../../middleware/adminLayout');
const { validateString, validateUrl } = require('../../utils/validation');
const { logAdminAction } = require('../../utils/adminLogger');
const path = require('path');
const fs = require('fs');

// Apply middleware
router.use(adminLayout);

// GET /admin/blog - Blog dashboard
router.get('/', async (req, res) => {
  try {
    // Get blog stats
    const [statsResult] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') as published_posts,
        (SELECT COUNT(*) FROM blog_posts WHERE status = 'draft') as draft_posts,
        (SELECT COUNT(*) FROM blog_comments WHERE status = 'pending') as pending_comments,
        (SELECT COUNT(*) FROM blog_categories WHERE active = 1) as active_categories,
        (SELECT SUM(views) FROM blog_posts) as total_views,
        (SELECT COUNT(*) FROM blog_comments WHERE status = 'approved') as approved_comments
    `);

    // Get recent posts
    const [recentPosts] = await db.query(`
      SELECT p.*, c.name as category_name, u.username as author_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // Get recent comments
    const [recentComments] = await db.query(`
      SELECT c.*, p.title as post_title, p.slug as post_slug
      FROM blog_comments c
      LEFT JOIN blog_posts p ON c.post_id = p.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    res.render('admin/blog-dashboard', {
      stats: statsResult[0],
      recentPosts,
      recentComments,
      pageTitle: 'Blog Management',
      pageSubtitle: 'Manage blog posts, categories, and comments'
    });
  } catch (error) {
    console.error('Error loading blog dashboard:', error);
    res.status(500).render('error', { error: 'Failed to load blog dashboard' });
  }
});

// GET /admin/blog/posts - List all posts
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';
    const category = req.query.category || 'all';

    let whereClause = '';
    let params = [limit, offset];

    if (status !== 'all') {
      whereClause += ' AND p.status = ?';
      params.unshift(status);
    }

    if (category !== 'all') {
      whereClause += ' AND p.category_id = ?';
      params.unshift(category);
    }

    // Get posts
    const [posts] = await db.query(`
      SELECT p.*, c.name as category_name, c.color as category_color, u.username as author_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE 1=1 ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, params);

    // Get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total FROM blog_posts p WHERE 1=1 ${whereClause}
    `, params.slice(2));
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get categories for filter
    const [categories] = await db.query('SELECT id, name FROM blog_categories WHERE active = 1 ORDER BY name');

    res.render('admin/blog-posts', {
      posts,
      categories,
      currentPage: page,
      totalPages,
      total,
      filters: { status, category },
      pageTitle: 'Blog Posts',
      pageSubtitle: 'Manage your blog posts'
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).render('error', { error: 'Failed to load blog posts' });
  }
});

// GET /admin/blog/posts/new - Create new post form
router.get('/posts/new', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT id, name, color FROM blog_categories WHERE active = 1 ORDER BY sort_order');
    const [tags] = await db.query('SELECT id, name, slug, color FROM blog_tags ORDER BY name');

    res.render('admin/blog-post-form', {
      post: null,
      categories,
      tags,
      isEdit: false,
      pageTitle: 'Create Blog Post',
      pageSubtitle: 'Write a new blog post'
    });
  } catch (error) {
    console.error('Error loading create post form:', error);
    res.status(500).render('error', { error: 'Failed to load form' });
  }
});

// POST /admin/blog/posts - Create new post
router.post('/posts', async (req, res) => {
  try {
    const {
      title, slug, excerpt, content, category_id, status,
      published_at, seo_title, seo_description, seo_keywords,
      comments_enabled, featured_image, tags
    } = req.body;

    // Validate required fields
    if (!validateString(title, 1, 255)) {
      return res.render('admin/blog-post-form', {
        post: req.body,
        error: 'Title must be between 1-255 characters',
        isEdit: false,
        pageTitle: 'Create Blog Post'
      });
    }

    if (!validateString(content, 1)) {
      return res.render('admin/blog-post-form', {
        post: req.body,
        error: 'Content is required',
        isEdit: false,
        pageTitle: 'Create Blog Post'
      });
    }

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Check for duplicate slug
    const [existing] = await db.query('SELECT id FROM blog_posts WHERE slug = ?', [finalSlug]);
    if (existing.length > 0) {
      finalSlug += '-' + Date.now();
    }

    // Insert post
    const [result] = await db.query(`
      INSERT INTO blog_posts (
        title, slug, excerpt, content, featured_image, category_id, author_id,
        status, published_at, comments_enabled, seo_title, seo_description, seo_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, finalSlug, excerpt || '', content, featured_image || null,
      category_id || null, req.session.currentUser.id,
      status || 'draft', published_at || (status === 'published' ? new Date() : null),
      comments_enabled ? 1 : 0, seo_title || null, seo_description || null, seo_keywords || null
    ]);

    // Add tags
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await db.query('INSERT INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)', [result.insertId, tagId]);
      }
    }

    // Log action
    await logAdminAction(req.session.currentUser.id, 'CREATE_BLOG_POST', `Created blog post: ${title}`, 'blog_post', result.insertId, req.ip);

    req.flash('success', 'Blog post created successfully');
    res.redirect('/admin/blog/posts');
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.render('admin/blog-post-form', {
      post: req.body,
      error: 'Failed to create blog post',
      isEdit: false,
      pageTitle: 'Create Blog Post'
    });
  }
});

// GET /admin/blog/posts/:id/edit - Edit post form
router.get('/posts/:id/edit', async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.*, GROUP_CONCAT(pt.tag_id) as tag_ids
      FROM blog_posts p
      LEFT JOIN blog_post_tags pt ON p.id = pt.post_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [req.params.id]);

    if (posts.length === 0) {
      return res.status(404).render('error', { error: 'Blog post not found' });
    }

    const post = posts[0];
    post.tags = post.tag_ids ? post.tag_ids.split(',').map(id => parseInt(id)) : [];

    const [categories] = await db.query('SELECT id, name, color FROM blog_categories WHERE active = 1 ORDER BY sort_order');
    const [allTags] = await db.query('SELECT id, name, slug, color FROM blog_tags ORDER BY name');

    res.render('admin/blog-post-form', {
      post,
      categories,
      tags: allTags,
      isEdit: true,
      pageTitle: 'Edit Blog Post',
      pageSubtitle: 'Update blog post details'
    });
  } catch (error) {
    console.error('Error loading edit post form:', error);
    res.status(500).render('error', { error: 'Failed to load form' });
  }
});

// POST /admin/blog/posts/:id - Update post
router.post('/posts/:id', async (req, res) => {
  try {
    const {
      title, slug, excerpt, content, category_id, status,
      published_at, seo_title, seo_description, seo_keywords,
      comments_enabled, featured_image, tags
    } = req.body;

    // Validate required fields
    if (!validateString(title, 1, 255)) {
      return res.status(400).json({ error: 'Title must be between 1-255 characters' });
    }

    if (!validateString(content, 1)) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Check for duplicate slug (excluding current post)
    const [existing] = await db.query('SELECT id FROM blog_posts WHERE slug = ? AND id != ?', [finalSlug, req.params.id]);
    if (existing.length > 0) {
      finalSlug += '-' + Date.now();
    }

    // Update post
    await db.query(`
      UPDATE blog_posts SET
        title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?,
        category_id = ?, status = ?, published_at = ?, comments_enabled = ?,
        seo_title = ?, seo_description = ?, seo_keywords = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, finalSlug, excerpt || '', content, featured_image || null,
      category_id || null, status || 'draft',
      published_at || (status === 'published' && !published_at ? new Date() : published_at),
      comments_enabled ? 1 : 0, seo_title || null, seo_description || null,
      seo_keywords || null, req.params.id
    ]);

    // Update tags
    await db.query('DELETE FROM blog_post_tags WHERE post_id = ?', [req.params.id]);
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await db.query('INSERT INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)', [req.params.id, tagId]);
      }
    }

    res.json({ success: true, message: 'Blog post updated successfully' });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE /admin/blog/posts/:id - Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    // Get post details before deletion for logging
    const [posts] = await db.query('SELECT title FROM blog_posts WHERE id = ?', [req.params.id]);
    const post = posts[0];

    // Delete post (cascade will handle tags and comments)
    await db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);

    // Log action
    await logAdminAction(req.session.currentUser.id, 'DELETE_BLOG_POST', `Deleted blog post: ${post.title}`, 'blog_post', req.params.id, req.ip);

    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// GET /admin/blog/categories - List categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*, COUNT(p.id) as post_count
      FROM blog_categories c
      LEFT JOIN blog_posts p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `);

    res.render('admin/blog-categories', {
      categories,
      pageTitle: 'Blog Categories',
      pageSubtitle: 'Manage blog categories'
    });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).render('error', { error: 'Failed to load categories' });
  }
});

// POST /admin/blog/categories - Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, description, color, icon, sort_order, active } = req.body;

    if (!validateString(name, 1, 100)) {
      return res.status(400).json({ error: 'Name must be between 1-100 characters' });
    }

    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Check for duplicate slug
    const [existing] = await db.query('SELECT id FROM blog_categories WHERE slug = ?', [finalSlug]);
    if (existing.length > 0) {
      finalSlug += '-' + Date.now();
    }

    await db.query(`
      INSERT INTO blog_categories (name, slug, description, color, icon, sort_order, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, finalSlug, description || '', color || '#667eea', icon || 'fas fa-folder', sort_order || 0, active ? 1 : 0]);

    res.json({ success: true, message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// POST /admin/blog/categories/:id - Update category
router.post('/categories/:id', async (req, res) => {
  try {
    const { name, slug, description, color, icon, sort_order, active } = req.body;

    if (!validateString(name, 1, 100)) {
      return res.status(400).json({ error: 'Name must be between 1-100 characters' });
    }

    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Check for duplicate slug (excluding current)
    const [existing] = await db.query('SELECT id FROM blog_categories WHERE slug = ? AND id != ?', [finalSlug, req.params.id]);
    if (existing.length > 0) {
      finalSlug += '-' + Date.now();
    }

    await db.query(`
      UPDATE blog_categories SET
        name = ?, slug = ?, description = ?, color = ?, icon = ?,
        sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, finalSlug, description || '', color || '#667eea', icon || 'fas fa-folder', sort_order || 0, active ? 1 : 0, req.params.id]);

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /admin/blog/categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    // Check if category has posts
    const [posts] = await db.query('SELECT COUNT(*) as count FROM blog_posts WHERE category_id = ?', [req.params.id]);
    if (posts[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with existing posts' });
    }

    await db.query('DELETE FROM blog_categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// GET /admin/blog/comments - List comments
router.get('/comments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';

    let whereClause = '';
    let params = [limit, offset];

    if (status !== 'all') {
      whereClause = 'WHERE c.status = ?';
      params.unshift(status);
    }

    const [comments] = await db.query(`
      SELECT c.*, p.title as post_title, p.slug as post_slug
      FROM blog_comments c
      LEFT JOIN blog_posts p ON c.post_id = p.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, params);

    const [countResult] = await db.query(`
      SELECT COUNT(*) as total FROM blog_comments c ${whereClause}
    `, params.slice(2));
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.render('admin/blog-comments', {
      comments,
      currentPage: page,
      totalPages,
      total,
      filters: { status },
      pageTitle: 'Blog Comments',
      pageSubtitle: 'Manage blog comments'
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).render('error', { error: 'Failed to load comments' });
  }
});

// POST /admin/blog/comments/:id/status - Update comment status
router.post('/comments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'spam', 'trash'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query('UPDATE blog_comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);

    res.json({ success: true, message: 'Comment status updated' });
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({ error: 'Failed to update comment status' });
  }
});

// DELETE /admin/blog/comments/:id - Delete comment
router.delete('/comments/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM blog_comments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
