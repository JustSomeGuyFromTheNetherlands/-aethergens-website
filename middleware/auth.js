const { getDB } = require('../database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { checkRateLimit } = require('./rateLimit');

const AUTH_SESSION_KEY = 'aethergens_admin';
const AUTH_TIMEOUT = config.session.lifetime;
const AUTH_FILE = path.join(config.basePath, '.auth.json');

function initAuthFile() {
  if (!fs.existsSync(AUTH_FILE)) {
    const defaultAuth = {
      username: 'admin',
      password_hash: bcrypt.hashSync('ikhouvankaas', 10),
      created_at: new Date().toISOString()
    };
    fs.writeFileSync(AUTH_FILE, JSON.stringify(defaultAuth, null, 2));
  }
}

async function verifyCredentials(username, password) {
  const db = getDB();
  
  try {
    // Try database first
    const user = await db.fetchOne(
      "SELECT * FROM users WHERE username = ? AND active = 1",
      [username]
    );
    
    if (user && await bcrypt.compare(password, user.password_hash)) {
      // Update last login
      await db.update('users', 
        { last_login: new Date().toISOString() },
        'id = ?',
        [user.id]
      );
      return true;
    }
  } catch (error) {
    console.error('Auth DB error:', error.message);
  }
  
  // Fallback to JSON auth file
  initAuthFile();
  if (fs.existsSync(AUTH_FILE)) {
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    if (authData && authData.username === username && 
        await bcrypt.compare(password, authData.password_hash)) {
      
      // Try to migrate to database
      try {
        const existing = await db.fetchOne("SELECT id FROM users WHERE username = ?", [username]);
        if (!existing) {
          await db.insert('users', {
            username: username,
            password_hash: authData.password_hash,
            role: 'admin',
            active: 1
          });
        }
      } catch (error) {
        console.error('Auth migration error:', error.message);
      }
      
      return true;
    }
  }
  
  return false;
}

async function login(req, username, password) {
  const clientIp = getClientIp(req);
  
  // Rate limiting check
  const rateLimit = await checkRateLimit('login', 5, 900000, clientIp);
  if (!rateLimit.allowed) {
    console.error(`Login rate limit exceeded for IP: ${clientIp}`);
    return false;
  }
  
  if (await verifyCredentials(username, password)) {
    // Regenerate session ID
    return new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          reject(err);
          return;
        }
        
        req.session[AUTH_SESSION_KEY] = {
          username: username,
          login_time: Date.now(),
          ip: clientIp
        };
        
        resolve(true);
      });
    });
  }
  
  // Increment rate limit on failed login
  await checkRateLimit('login', 5, 900000, clientIp);
  return false;
}

function logout(req) {
  delete req.session[AUTH_SESSION_KEY];
  req.session.destroy();
}

function isAuthenticated(req) {
  if (!req.session || !req.session[AUTH_SESSION_KEY]) {
    return false;
  }
  
  const auth = req.session[AUTH_SESSION_KEY];
  
  // Check timeout
  if (auth.login_time && (Date.now() - auth.login_time) > AUTH_TIMEOUT) {
    logout(req);
    return false;
  }
  
  // Update last activity
  req.session[AUTH_SESSION_KEY].last_activity = Date.now();
  
  return true;
}

function requireAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.redirect('/admin/login?login=required');
  }
  next();
}

function getCurrentAdmin(req) {
  if (isAuthenticated(req)) {
    return req.session[AUTH_SESSION_KEY].username;
  }
  return null;
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         '0.0.0.0';
}

module.exports = {
  login,
  logout,
  isAuthenticated,
  requireAuth,
  getCurrentAdmin,
  getClientIp
};

