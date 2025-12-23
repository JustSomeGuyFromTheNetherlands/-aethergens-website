const express = require('express');
const router = express.Router();
const { getDB } = require('../../database');
const { sendAppealWebhook } = require('../../utils/webhooks');
const { writeBotDataFile } = require('../../utils/botDataWriter');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1").catch(() => ({ server_name: 'Minecraft Server' }));
    
    let banInfo = null;
    if (req.query.username) {
      banInfo = await db.fetchOne(
        "SELECT * FROM bans WHERE player_username = ? AND active = 1 ORDER BY ban_date DESC LIMIT 1",
        [req.query.username]
      );
    }
    
    res.render('public/appeal', {
      serverSettings,
      banInfo,
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
    const { username, email, appeal_text } = req.body;
    
    if (!username || !email || !appeal_text) {
      return res.redirect('/public/appeal?error=' + encodeURIComponent('Please fill in all required fields.'));
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.redirect('/public/appeal?error=' + encodeURIComponent('Invalid email address.'));
    }
    
    const ban = await db.fetchOne(
      "SELECT * FROM bans WHERE player_username = ? AND active = 1 ORDER BY ban_date DESC LIMIT 1",
      [username]
    );
    
    if (!ban) {
      return res.redirect('/public/appeal?error=' + encodeURIComponent('No active ban found for this username.'));
    }
    
    const existing = await db.fetchOne(
      "SELECT id FROM appeals WHERE player_username = ? AND status = 'pending'",
      [username]
    );
    
    if (existing) {
      return res.redirect('/public/appeal?error=' + encodeURIComponent('You already have a pending appeal.'));
    }
    
    const appealId = await db.insert('appeals', {
      ban_id: ban.id,
      player_username: username,
      player_email: email,
      appeal_text: appeal_text,
      status: 'pending'
    });
    
    const appealData = await db.fetchOne("SELECT * FROM appeals WHERE id = ?", [appealId]);
    await sendAppealWebhook(appealData, 'created');
    await writeBotDataFile();
    
    res.redirect('/public/appeal?message=' + encodeURIComponent('Your appeal has been submitted successfully. We will review it soon.'));
  } catch (error) {
    res.redirect('/public/appeal?error=' + encodeURIComponent(error.message));
  }
});

module.exports = router;


