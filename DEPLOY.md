# AetherGens Website - VPS Deployment Guide

## Quick Start

1. **Upload files to your VPS**
   ```bash
   scp -r * user@your-vps:/path/to/aethergens-website/
   ```

2. **SSH into your VPS**
   ```bash
   ssh user@your-vps
   cd /path/to/aethergens-website
   ```

3. **Run installation script**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

4. **Configure environment**
   ```bash
   nano .env
   # Edit with your settings
   ```

5. **Start with PM2 (recommended)**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Manual Installation

### Requirements
- Node.js 18+ 
- npm or yarn

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build frontend**
   ```bash
   npm run build
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   nano .env
   ```

4. **Start server**
   ```bash
   NODE_ENV=production npm run start:prod
   ```

## PM2 Process Manager (Recommended)

PM2 keeps your application running and restarts it automatically.

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# View logs
pm2 logs aethergens-website

# Restart
pm2 restart aethergens-website

# Stop
pm2 stop aethergens-website

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Nginx Reverse Proxy Setup

**IMPORTANT:** The backend server MUST be running on port 3001 for this to work!

1. **Copy Nginx configuration:**
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/aethergens
   sudo nano /etc/nginx/sites-available/aethergens
   # Update server_name with your domain
   ```

2. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/aethergens /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Verify backend is running:**
   ```bash
   # Test backend directly
   curl http://localhost:3001/api/server-info
   # Should return JSON, not 404
   
   # If 404, start backend:
   pm2 start ecosystem.config.js
   # Or
   NODE_ENV=production npm run start:prod
   ```

4. **Check Nginx logs if issues persist:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

## SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Variables

Edit `.env` file:

```env
PORT=3001
NODE_ENV=production

# Mailjet (Optional)
MAILJET_API_KEY=your_key
MAILJET_API_SECRET=your_secret
MAILJET_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

## Troubleshooting

- **Port already in use**: Change PORT in `.env` or kill process: `lsof -ti:3001 | xargs kill`
- **Build fails**: Check Node.js version: `node -v` (needs 18+)
- **PM2 not starting**: Check logs: `pm2 logs aethergens-website`
- **Data not saving**: Check `server/data/` directory permissions

## File Structure

```
aethergens-website/
├── server/
│   ├── data/          # JSON data files (auto-created)
│   ├── index.js       # Backend server
│   └── database.js    # Data management
├── src/               # React frontend source
├── dist/              # Built frontend (after npm run build)
├── install.sh         # Installation script
├── start.sh           # Start script
├── ecosystem.config.js # PM2 config
└── .env               # Environment variables
```


