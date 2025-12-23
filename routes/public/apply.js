const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { sendApplicationWebhook } = require('../../utils/webhooks');
const { writeBotDataFile } = require('../../utils/botDataWriter');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const roles = await db.fetchAll("SELECT * FROM application_roles WHERE status = 'open' ORDER BY role ASC");
    
    res.render('public/apply', {
      roles,
      message: req.query.message,
      error: req.query.error
    });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { role, username, email, discord, age, experience } = req.body;
    
    if (!role || !username || !email || !discord || !experience) {
      return res.redirect('/public/apply?error=' + encodeURIComponent('Please fill in all required fields.'));
    }
    
    if (parseInt(age) < 13) {
      return res.redirect('/public/apply?error=' + encodeURIComponent('You must be at least 13 years old to apply.'));
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.redirect('/public/apply?error=' + encodeURIComponent('Invalid email address.'));
    }
    
    const existing = await db.fetchOne(
      "SELECT id FROM applications_pending WHERE username = ? AND role = ? AND status = 'pending'",
      [username, role]
    );
    
    if (existing) {
      return res.redirect('/public/apply?error=' + encodeURIComponent('You have already applied for this role.'));
    }
    
    const appId = await db.insert('applications_pending', {
      role,
      username,
      email,
      discord,
      age: parseInt(age),
      experience,
      status: 'pending'
    });
    
    const appData = await db.fetchOne("SELECT * FROM applications_pending WHERE id = ?", [appId]);
    await sendApplicationWebhook(appData, 'created');
    await writeBotDataFile();
    
    res.redirect('/public/apply?message=' + encodeURIComponent('Application submitted successfully! We will review it soon.'));
  } catch (error) {
    res.redirect('/public/apply?error=' + encodeURIComponent(error.message));
  }
});

module.exports = router;


