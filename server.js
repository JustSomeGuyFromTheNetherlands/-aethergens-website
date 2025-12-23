const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config');
const { setSecurityHeaders, setCSPHeaders, helmetMiddleware } = require('./middleware/security');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(helmetMiddleware);
app.use(setSecurityHeaders);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  name: config.session.name,
  cookie: {
    httpOnly: true,
    secure: config.env === 'production',
    maxAge: config.session.lifetime,
    sameSite: 'strict'
  }
}));

// Routes - Install routes first (before catch-all routes)
app.use('/api/install', require('./routes/api/install'));

// Direct route for database install
app.get('/database/install', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Database Installation</title>
      <style>
        body { font-family: monospace; background: #0f172a; color: #e2e8f0; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #10b981; }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        .skip { color: #f59e0b; }
        pre { background: #1e293b; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
        .btn { background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
        .btn:hover { background: #059669; }
      </style>
    </head>
    <body>
      <h1>Database Installation</h1>
      <pre id="output">Click the button below to install the database tables...</pre>
      <button class="btn" onclick="install()">Install Database</button>
      <script>
        async function install() {
          const output = document.getElementById('output');
          output.textContent = 'Installing... Please wait...\\n\\n';
          
          try {
            const response = await fetch('/api/install');
            const text = await response.text();
            output.innerHTML = text
              .replace(/✓/g, '<span class="success">✓</span>')
              .replace(/⊘/g, '<span class="skip">⊘</span>')
              .replace(/✗/g, '<span class="error">✗</span>')
              .replace(/\\n/g, '<br>');
            
            if (text.includes('Installation complete')) {
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            }
          } catch (error) {
            output.innerHTML = '<span class="error">Error: ' + error.message + '</span>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Other routes
app.use('/admin', require('./routes/admin'));
app.use('/api/search', require('./routes/api/search'));
app.use('/api/v1', require('./routes/api'));

// Public routes (must be last to avoid catching install routes)
app.use('/', require('./routes/public'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Check if it's a database table missing error
  if (err.message && (err.message.includes("doesn't exist") || err.message.includes("Unknown table"))) {
    if (req.path.startsWith('/api')) {
      return res.status(500).json({ error: 'Database tables not found. Please run the installation script at /database/install' });
    }
    return res.redirect('/database/install');
  }
  
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      error: config.env === 'production' ? 'Internal Server Error' : err.message
    });
  }
  
  res.status(err.status || 500).render('error', {
    error: config.env === 'production' ? 'Internal Server Error' : err.message
  });
});

// Export app for Vercel serverless deployment
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || config.env}`);
  });
}

