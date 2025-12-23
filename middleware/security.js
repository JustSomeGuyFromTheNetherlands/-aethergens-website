const helmet = require('helmet');
const crypto = require('crypto');

function setSecurityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
}

function setCSPHeaders(req, res, next) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://static.cloudflareinsights.com"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  next();
}

function generateCSRFToken(req) {
  if (!req.session.csrf_token) {
    req.session.csrf_token = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrf_token;
}

function getCSRFToken(req) {
  return generateCSRFToken(req);
}

function validateCSRFToken(req, token) {
  if (!req.session.csrf_token) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(req.session.csrf_token),
    Buffer.from(token)
  );
}

function requireCSRFToken(req, res, next) {
  if (req.method === 'POST') {
    const token = req.body.csrf_token || req.headers['x-csrf-token'];
    if (!validateCSRFToken(req, token)) {
      return res.status(403).send('Invalid CSRF token');
    }
  }
  next();
}

function regenerateCSRFToken(req) {
  delete req.session.csrf_token;
  return generateCSRFToken(req);
}

const helmetMiddleware = helmet({
  contentSecurityPolicy: false // We handle CSP manually
});

module.exports = {
  setSecurityHeaders,
  setCSPHeaders,
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  requireCSRFToken,
  regenerateCSRFToken,
  helmetMiddleware
};

