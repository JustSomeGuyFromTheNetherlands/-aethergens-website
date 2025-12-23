const express = require('express');
const router = express.Router();
const { install } = require('../../database/install');

router.get('/', async (req, res) => {
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

module.exports = router;

