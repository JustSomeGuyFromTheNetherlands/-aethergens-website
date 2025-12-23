const axios = require('axios');
const { getDB } = require('../database');

async function getWebhookUrl(type) {
  const db = getDB();
  const webhook = await db.fetchOne("SELECT url FROM webhooks WHERE name = ? AND active = 1", [type]);
  return webhook ? webhook.url : null;
}

async function getWebhookProxy() {
  try {
    const db = getDB();
    const result = await db.fetchOne("SELECT value FROM config WHERE `key` = ?", ['webhook_proxy_url']);
    return result && result.value ? result.value.trim() : null;
  } catch (error) {
    console.error('Error getting webhook proxy:', error.message);
    return null;
  }
}

async function sendDiscordWebhook(url, data) {
  if (!url) return false;

  const payload = {
    username: data.username || 'Minecraft CMS',
    embeds: [{
      title: data.title || 'Notification',
      description: data.description || '',
      color: data.color || 3447003,
      timestamp: new Date().toISOString(),
      fields: data.fields || [],
      footer: {
        text: data.footer || 'Minecraft Server CMS'
      }
    }]
  };

  if (data.avatar_url) {
    payload.avatar_url = data.avatar_url;
  }

  const proxy = await getWebhookProxy();
  const targetUrl = proxy || url;
  const requestPayload = proxy ? { url, payload } : payload;

  try {
    const response = await axios.post(targetUrl, requestPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    return response.status === 204 || (response.status >= 200 && response.status < 300);
  } catch (error) {
    console.error('Webhook error:', error.message);
    return false;
  }
}

async function sendNewsWebhook(newsItem, action = 'created') {
  const url = await getWebhookUrl('news');
  if (!url) return false;

  const colors = {
    created: 3066993,
    updated: 3447003,
    deleted: 15158332
  };

  return await sendDiscordWebhook(url, {
    title: (action === 'created' ? 'New Announcement' : action.charAt(0).toUpperCase() + action.slice(1) + ' Announcement'),
    description: newsItem.title,
    color: colors[action] || 3447003,
    fields: [
      {
        name: 'Content',
        value: newsItem.content.substring(0, 1000) + (newsItem.content.length > 1000 ? '...' : ''),
        inline: false
      },
      {
        name: 'Author',
        value: newsItem.author || 'Unknown',
        inline: true
      },
      {
        name: 'Status',
        value: newsItem.published ? 'Published' : 'Draft',
        inline: true
      }
    ],
    footer: 'Minecraft Server CMS'
  });
}

async function sendBanWebhook(banData, action = 'created') {
  const url = await getWebhookUrl('bans');
  if (!url) return false;

  const colors = {
    created: 15158332,
    removed: 3066993
  };

  const fields = [
    { name: 'Player', value: banData.player_username, inline: true },
    { name: 'Banned By', value: banData.banned_by || 'System', inline: true },
    { name: 'Reason', value: banData.reason || 'No reason provided', inline: false }
  ];

  if (banData.expires_at) {
    fields.push({
      name: 'Expires',
      value: new Date(banData.expires_at).toLocaleString(),
      inline: true
    });
  } else {
    fields.push({
      name: 'Duration',
      value: 'Permanent',
      inline: true
    });
  }

  return await sendDiscordWebhook(url, {
    title: (action === 'created' ? 'Player Banned' : 'Ban Removed'),
    description: action === 'created' ? 'A player has been banned from the server' : 'A ban has been removed',
    color: colors[action] || 15158332,
    fields,
    footer: 'Minecraft Server CMS'
  });
}

async function sendAppealWebhook(appealData, action = 'created') {
  const url = await getWebhookUrl('appeals');
  if (!url) return false;

  const colors = {
    created: 16776960,
    accepted: 3066993,
    denied: 15158332
  };

  const fields = [
    { name: 'Player', value: appealData.player_username, inline: true },
    { name: 'Status', value: (appealData.status || 'pending').charAt(0).toUpperCase() + (appealData.status || 'pending').slice(1), inline: true }
  ];

  if (action === 'created') {
    fields.push({
      name: 'Appeal',
      value: appealData.appeal_text.substring(0, 1000),
      inline: false
    });
  } else {
    fields.push({
      name: 'Reviewed By',
      value: appealData.reviewed_by || 'System',
      inline: true
    });
  }

  return await sendDiscordWebhook(url, {
    title: (action === 'created' ? 'New Ban Appeal' : action.charAt(0).toUpperCase() + action.slice(1) + ' Appeal'),
    description: action === 'created' ? 'A player has submitted a ban appeal' : `A ban appeal has been ${action}`,
    color: colors[action] || 16776960,
    fields,
    footer: 'Minecraft Server CMS'
  });
}

async function sendApplicationWebhook(appData, action = 'created') {
  const url = await getWebhookUrl('applications');
  if (!url) return false;

  const colors = {
    created: 16776960,
    accepted: 3066993,
    rejected: 15158332
  };

  const fields = [
    { name: 'Applicant', value: appData.username || appData.name, inline: true },
    { name: 'Role', value: appData.role, inline: true }
  ];

  if (action === 'created') {
    fields.push(
      { name: 'Discord', value: appData.discord || 'N/A', inline: true },
      { name: 'Experience', value: (appData.experience || '').substring(0, 500), inline: false }
    );
  } else {
    fields.push({
      name: 'Reviewed By',
      value: appData.reviewed_by || 'System',
      inline: true
    });
  }

  return await sendDiscordWebhook(url, {
    title: (action === 'created' ? 'New Staff Application' : action.charAt(0).toUpperCase() + action.slice(1) + ' Application'),
    description: action === 'created' ? 'A new staff application has been submitted' : `A staff application has been ${action}`,
    color: colors[action] || 16776960,
    fields,
    footer: 'Minecraft Server CMS'
  });
}

module.exports = {
  getWebhookUrl,
  getWebhookProxy,
  sendDiscordWebhook,
  sendNewsWebhook,
  sendBanWebhook,
  sendAppealWebhook,
  sendApplicationWebhook
};


