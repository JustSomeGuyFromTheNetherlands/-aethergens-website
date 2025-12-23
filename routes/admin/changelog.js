const express = require('express');
const router = express.Router();
const db = require('../../database');
const { requireAuth } = require('../../middleware/auth');
const { adminLayout } = require('../../middleware/adminLayout');
const { validateString, validateDate } = require('../../utils/validation');
const { logAdminAction } = require('../../utils/adminLogger');

// Apply middleware
router.use(adminLayout);

// GET /admin/changelog - List all changelog entries
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get changelog entries
    const [entries] = await db.query(`
      SELECT id, version, title, description, release_date, is_major, created_at, updated_at
      FROM changelog
      ORDER BY release_date DESC, created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Get total count
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM changelog');
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get stats
    const [statsResult] = await db.query(`
      SELECT
        COUNT(*) as total_entries,
        SUM(CASE WHEN is_major = 1 THEN 1 ELSE 0 END) as major_releases,
        MAX(release_date) as latest_release
      FROM changelog
    `);
    const stats = statsResult[0];

    res.render('admin/changelog', {
      entries,
      currentPage: page,
      totalPages,
      total,
      stats,
      pageTitle: 'Changelog Management',
      pageSubtitle: 'Manage version updates and release notes'
    });
  } catch (error) {
    console.error('Error fetching changelog:', error);
    res.status(500).render('error', { error: 'Failed to load changelog entries' });
  }
});

// GET /admin/changelog/new - Show create form
router.get('/new', (req, res) => {
  res.render('admin/changelog-form', {
    entry: null,
    isEdit: false,
    pageTitle: 'Add Changelog Entry',
    pageSubtitle: 'Create a new changelog entry'
  });
});

// POST /admin/changelog - Create new entry
router.post('/', async (req, res) => {
  try {
    const { version, title, description, release_date, is_major } = req.body;

    // Validate input
    if (!validateString(version, 1, 20)) {
      return res.render('admin/changelog-form', {
        entry: req.body,
        isEdit: false,
        error: 'Version must be between 1-20 characters',
        pageTitle: 'Add Changelog Entry',
        pageSubtitle: 'Create a new changelog entry'
      });
    }

    if (!validateString(title, 1, 255)) {
      return res.render('admin/changelog-form', {
        entry: req.body,
        isEdit: false,
        error: 'Title must be between 1-255 characters',
        pageTitle: 'Add Changelog Entry',
        pageSubtitle: 'Create a new changelog entry'
      });
    }

    if (!validateDate(release_date)) {
      return res.render('admin/changelog-form', {
        entry: req.body,
        isEdit: false,
        error: 'Invalid release date format',
        pageTitle: 'Add Changelog Entry',
        pageSubtitle: 'Create a new changelog entry'
      });
    }

    // Insert new entry
    const [result] = await db.query(`
      INSERT INTO changelog (version, title, description, release_date, is_major)
      VALUES (?, ?, ?, ?, ?)
    `, [version, title, description || '', release_date, is_major ? 1 : 0]);

    // Log action
    await logAdminAction(req.session.currentUser.id, 'CREATE_CHANGELOG', `Created changelog entry: ${title} (${version})`, 'changelog', result.insertId, req.ip);

    req.flash('success', 'Changelog entry created successfully');
    res.redirect('/admin/changelog');
  } catch (error) {
    console.error('Error creating changelog entry:', error);
    res.render('admin/changelog-form', {
      entry: req.body,
      isEdit: false,
      error: 'Failed to create changelog entry',
      pageTitle: 'Add Changelog Entry',
      pageSubtitle: 'Create a new changelog entry'
    });
  }
});

// GET /admin/changelog/:id/edit - Show edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const [entries] = await db.query('SELECT * FROM changelog WHERE id = ?', [req.params.id]);

    if (entries.length === 0) {
      return res.status(404).render('error', { error: 'Changelog entry not found' });
    }

    res.render('admin/changelog-form', {
      entry: entries[0],
      isEdit: true,
      pageTitle: 'Edit Changelog Entry',
      pageSubtitle: 'Update changelog entry details'
    });
  } catch (error) {
    console.error('Error fetching changelog entry:', error);
    res.status(500).render('error', { error: 'Failed to load changelog entry' });
  }
});

// POST /admin/changelog/:id - Update entry
router.post('/:id', async (req, res) => {
  try {
    const { version, title, description, release_date, is_major } = req.body;

    // Validate input
    if (!validateString(version, 1, 20)) {
      return res.status(400).json({ error: 'Version must be between 1-20 characters' });
    }

    if (!validateString(title, 1, 255)) {
      return res.status(400).json({ error: 'Title must be between 1-255 characters' });
    }

    if (!validateDate(release_date)) {
      return res.status(400).json({ error: 'Invalid release date format' });
    }

    // Update entry
    await db.query(`
      UPDATE changelog
      SET version = ?, title = ?, description = ?, release_date = ?, is_major = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [version, title, description || '', release_date, is_major ? 1 : 0, req.params.id]);

    // Log action
    await logAdminAction(req.session.currentUser.id, 'UPDATE_CHANGELOG', `Updated changelog entry ID: ${req.params.id}`, 'changelog', req.params.id, req.ip);

    res.json({ success: true, message: 'Changelog entry updated successfully' });
  } catch (error) {
    console.error('Error updating changelog entry:', error);
    res.status(500).json({ error: 'Failed to update changelog entry' });
  }
});

// DELETE /admin/changelog/:id - Delete entry
router.delete('/:id', async (req, res) => {
  try {
    // Get entry details before deletion for logging
    const [entries] = await db.query('SELECT title, version FROM changelog WHERE id = ?', [req.params.id]);
    const entry = entries[0];

    // Delete entry
    await db.query('DELETE FROM changelog WHERE id = ?', [req.params.id]);

    // Log action
    await logAdminAction(req.session.currentUser.id, 'DELETE_CHANGELOG', `Deleted changelog entry: ${entry.title} (${entry.version})`, 'changelog', req.params.id, req.ip);

    res.json({ success: true, message: 'Changelog entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting changelog entry:', error);
    res.status(500).json({ error: 'Failed to delete changelog entry' });
  }
});

module.exports = router;
