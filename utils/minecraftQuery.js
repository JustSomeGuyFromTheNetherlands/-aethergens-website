const axios = require('axios');
const { getCache, setCache } = require('./cache');
const { getDB } = require('../database');

async function queryServerTCP(host, port = 25565) {
  // Simplified - in production you'd use a proper Minecraft protocol library
  // For now, we'll use mcstatus.io API
  return await getServerStatusFromAPI(host, port);
}

async function getServerStatusFromAPI(host, port) {
  const cacheKey = `server_status_mcstatus_${host}_${port}`;
  const cached = getCache(cacheKey, 10);
  if (cached !== false) {
    return cached;
  }
  
  try {
    const apiUrl = `https://api.mcstatus.io/v2/status/java/${host}:${port}`;
    const response = await axios.get(apiUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Minecraft-Server-CMS/1.0'
      }
    });
    
    const data = response.data;
    
    if (!data || data.online === undefined) {
      const result = { online: false, error: 'Invalid API response' };
      setCache(cacheKey, result, 30);
      return result;
    }
    
    const result = {
      online: data.online || false,
      players: data.players?.online || 0,
      max_players: data.players?.max || 0,
      version: data.version?.name_clean || data.version?.name || 'Unknown',
      motd: data.motd?.clean || (data.motd?.raw ? stripTags(data.motd.raw) : 'Minecraft Server'),
      player_list: data.players?.list?.map(p => p.name_clean) || []
    };
    
    // Clean MOTD
    if (Array.isArray(result.motd)) {
      result.motd = result.motd.join(' ');
    }
    result.motd = result.motd.replace(/§[0-9a-fk-or]/gi, '');
    
    setCache(cacheKey, result, 10);
    return result;
  } catch (error) {
    const result = { online: false, error: 'API request failed: ' + error.message };
    setCache(cacheKey, result, 30);
    return result;
  }
}

function stripTags(str) {
  return str.replace(/<[^>]*>/g, '');
}

async function getServerStatus() {
  const db = getDB();
  
  const serverSettings = await db.fetchOne("SELECT * FROM server_settings ORDER BY id DESC LIMIT 1");
  if (!serverSettings) {
    return { online: false, error: 'Server not configured' };
  }
  
  const host = serverSettings.server_ip;
  const port = serverSettings.server_port || 25565;
  
  const status = await getServerStatusFromAPI(host, port);
  
  // Merge with database settings
  return {
    ...status,
    server_name: serverSettings.server_name,
    server_ip: host,
    server_port: port,
    server_version: serverSettings.server_version,
    maintenance_mode: serverSettings.maintenance_mode,
    status_message: serverSettings.status_message
  };
}

module.exports = {
  queryServerTCP,
  getServerStatus,
  getServerStatusFromAPI
};


