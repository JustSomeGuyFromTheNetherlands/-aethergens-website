const fs = require('fs');
const path = require('path');
const config = require('../config');

const CACHE_DIR = path.join(config.basePath, 'cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getCache(key, ttl = 300) {
  const file = path.join(CACHE_DIR, `${require('crypto').createHash('md5').update(key).digest('hex')}.cache`);
  
  if (!fs.existsSync(file)) {
    return false;
  }
  
  try {
    const data = fs.readFileSync(file, 'utf8');
    const cache = JSON.parse(data);
    
    // Check if expired
    if (cache.expires && cache.expires < Date.now()) {
      fs.unlinkSync(file);
      return false;
    }
    
    return cache.value;
  } catch (error) {
    return false;
  }
}

function setCache(key, value, ttl = 300) {
  const file = path.join(CACHE_DIR, `${require('crypto').createHash('md5').update(key).digest('hex')}.cache`);
  
  const cache = {
    value: value,
    expires: Date.now() + (ttl * 1000),
    created: Date.now()
  };
  
  try {
    fs.writeFileSync(file, JSON.stringify(cache));
    return true;
  } catch (error) {
    return false;
  }
}

function deleteCache(key) {
  const file = path.join(CACHE_DIR, `${require('crypto').createHash('md5').update(key).digest('hex')}.cache`);
  
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    return true;
  } catch (error) {
    return false;
  }
}

function clearCache() {
  let count = 0;
  try {
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(file => {
      if (file.endsWith('.cache')) {
        try {
          fs.unlinkSync(path.join(CACHE_DIR, file));
          count++;
        } catch (error) {
          // Ignore errors
        }
      }
    });
  } catch (error) {
    // Ignore errors
  }
  return count;
}

function getCacheStats() {
  try {
    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.cache'));
    let totalSize = 0;
    let expired = 0;
    let active = 0;
    
    files.forEach(file => {
      const filePath = path.join(CACHE_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        
        const data = fs.readFileSync(filePath, 'utf8');
        const cache = JSON.parse(data);
        
        if (cache.expires && cache.expires < Date.now()) {
          expired++;
        } else {
          active++;
        }
      } catch (error) {
        // Ignore errors
      }
    });
    
    return {
      total_files: files.length,
      active_files: active,
      expired_files: expired,
      total_size: totalSize,
      total_size_mb: Math.round(totalSize / 1024 / 1024 * 100) / 100
    };
  } catch (error) {
    return {
      total_files: 0,
      active_files: 0,
      expired_files: 0,
      total_size: 0,
      total_size_mb: 0
    };
  }
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCache,
  getCacheStats
};

