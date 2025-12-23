const axios = require('axios');
const { getDB } = require('../database');

async function getMailjetConfig() {
  try {
    const db = getDB();
    const apiKey = await db.fetchOne("SELECT value FROM config WHERE `key` = ?", ['mailjet_api_key']);
    const apiSecret = await db.fetchOne("SELECT value FROM config WHERE `key` = ?", ['mailjet_api_secret']);
    const fromEmail = await db.fetchOne("SELECT value FROM config WHERE `key` = ?", ['mailjet_from_email']);
    const fromName = await db.fetchOne("SELECT value FROM config WHERE `key` = ?", ['mailjet_from_name']);

    return {
      mailjet_api_key: apiKey ? apiKey.value : '',
      mailjet_api_secret: apiSecret ? apiSecret.value : '',
      mailjet_from_email: fromEmail ? fromEmail.value : '',
      mailjet_from_name: fromName ? fromName.value : 'Minecraft Server'
    };
  } catch (error) {
    return {
      mailjet_api_key: '',
      mailjet_api_secret: '',
      mailjet_from_email: '',
      mailjet_from_name: 'Minecraft Server'
    };
  }
}

async function sendMailjetEmail(toEmail, toName, subject, htmlBody, textBody = null) {
  const config = await getMailjetConfig();

  if (!config.mailjet_api_key || !config.mailjet_api_secret) {
    console.error('Mailjet not configured');
    return false;
  }

  if (!textBody) {
    textBody = htmlBody.replace(/<[^>]*>/g, '');
  }

  const data = {
    Messages: [{
      From: {
        Email: config.mailjet_from_email,
        Name: config.mailjet_from_name
      },
      To: [{
        Email: toEmail,
        Name: toName
      }],
      Subject: subject,
      TextPart: textBody,
      HTMLPart: htmlBody
    }]
  };

  try {
    const response = await axios.post('https://api.mailjet.com/v3.1/send', data, {
      auth: {
        username: config.mailjet_api_key,
        password: config.mailjet_api_secret
      },
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Mailjet error:', error.message);
    return false;
  }
}

async function sendWelcomeEmail(email, username, password) {
  const html = `
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #334155;">
        <h1 style="color: #667eea; margin-bottom: 20px;">Welcome to Minecraft Server CMS!</h1>
        <p>Hello ${username},</p>
        <p>Your account has been created successfully.</p>
        <div style="background: #0f172a; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please log in and change your password immediately.</p>
        <p style="margin-top: 30px; color: #94a3b8; font-size: 12px;">This is an automated message. Please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  return await sendMailjetEmail(email, username, 'Welcome to Minecraft Server CMS', html);
}

async function sendAppealNotificationEmail(email, username, appealStatus) {
  const statusText = appealStatus.charAt(0).toUpperCase() + appealStatus.slice(1);
  const statusColor = appealStatus === 'accepted' ? '#10b981' : (appealStatus === 'denied' ? '#ef4444' : '#f59e0b');

  const html = `
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #334155;">
        <h1 style="color: #667eea; margin-bottom: 20px;">Ban Appeal Update</h1>
        <p>Hello ${username},</p>
        <p>Your ban appeal has been reviewed.</p>
        <div style="background: #0f172a; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusColor};">
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: ${statusColor};">Status: ${statusText}</p>
        </div>
        <p style="margin-top: 30px; color: #94a3b8; font-size: 12px;">This is an automated message. Please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  return await sendMailjetEmail(email, username, `Ban Appeal ${statusText}`, html);
}

async function sendBanNotificationEmail(email, username, reason, expiresAt = null, bannedBy = 'Admin') {
  const expiresText = expiresAt ? `Your ban will expire on ${new Date(expiresAt).toLocaleDateString()}.` : 'This ban is permanent.';

  const html = `
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #334155;">
        <h1 style="color: #ef4444; margin-bottom: 20px;">You Have Been Banned</h1>
        <p>Hello ${username},</p>
        <p>You have been banned from the server.</p>
        <div style="background: #0f172a; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
          <p style="margin: 5px 0;"><strong>Banned By:</strong> ${bannedBy}</p>
          <p style="margin: 5px 0;"><strong>Expiration:</strong> ${expiresText}</p>
        </div>
        <p>If you believe this ban was issued in error, you can submit an appeal through our website.</p>
        <p style="margin-top: 30px; color: #94a3b8; font-size: 12px;">This is an automated message. Please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  return await sendMailjetEmail(email, username, 'You Have Been Banned', html);
}

module.exports = {
  getMailjetConfig,
  sendMailjetEmail,
  sendWelcomeEmail,
  sendAppealNotificationEmail,
  sendBanNotificationEmail
};

