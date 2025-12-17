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

Create `/etc/nginx/sites-available/aethergens`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/aethergens /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
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


