require('dotenv').config();
const path = require('path');
const fs = require('fs');

const config = {
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'servercrm',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',

  // Security
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    lifetime: parseInt(process.env.SESSION_LIFETIME) || 3600000,
    name: 'aethergens.sid'
  },
  csrf: {
    tokenName: process.env.CSRF_TOKEN_NAME || 'csrf_token'
  },
  auth: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutTime: parseInt(process.env.LOGIN_LOCKOUT_TIME) || 900000
  },

  // Paths
  basePath: process.env.BASE_PATH || path.join(__dirname),
  logPath: process.env.LOG_PATH || path.join(__dirname, 'logs'),

  // Server
  port: parseInt(process.env.PORT) || 3000
};

// Ensure log directory exists
if (!fs.existsSync(config.logPath)) {
  fs.mkdirSync(config.logPath, { recursive: true });
}

module.exports = config;

