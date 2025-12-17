# Troubleshooting Guide

## API Endpoints Returning 404

If you're getting 404 errors for `/api/*` endpoints, check the following:

### 1. Check if the backend server is running

```bash
# Check if Node.js process is running
ps aux | grep node

# Or check if port 3001 is in use
netstat -tulpn | grep 3001
# Or on some systems:
ss -tulpn | grep 3001
```

### 2. Start the backend server

```bash
# Make sure you're in the project directory
cd aethergens-website

# Check if .env file exists and has correct settings
cat .env
# Should contain:
# NODE_ENV=production
# PORT=3001
# HOST=0.0.0.0

# Start with PM2 (recommended)
pm2 start ecosystem.config.js
pm2 logs aethergens-website

# Or start manually
NODE_ENV=production npm run start:prod
```

### 3. Check Nginx configuration

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### 4. Verify Nginx proxy configuration

Make sure `/etc/nginx/sites-available/aethergens` has:

```nginx
location /api {
    proxy_pass http://localhost:3001;
    # ... other proxy settings
}
```

Then reload Nginx:
```bash
sudo systemctl reload nginx
```

### 5. Check firewall

```bash
# Check if port 3001 is accessible locally
curl http://localhost:3001/api/server-info

# Check firewall rules
sudo ufw status
# If firewall is active, make sure port 80 and 443 are open
sudo ufw allow 80
sudo ufw allow 443
```

### 6. Test backend directly

```bash
# Test if backend responds on port 3001
curl http://localhost:3001/api/server-info

# Should return JSON, not 404
```

### 7. Check database initialization

```bash
# Check server logs for database errors
pm2 logs aethergens-website | grep -i database

# Or if running manually, check console output
```

### 8. Common Issues

**Issue: Port already in use**
```bash
# Find process using port 3001
lsof -ti:3001
# Kill it
kill -9 $(lsof -ti:3001)
# Or change PORT in .env
```

**Issue: Permission denied**
```bash
# Make sure user has permissions
sudo chown -R $USER:$USER aethergens-website
chmod +x install.sh start.sh
```

**Issue: Database file not created**
```bash
# Check if database file exists
ls -la server/aethergens.db
# If not, check logs for database initialization errors
```

**Issue: Nginx 502 Bad Gateway**
- Backend server is not running
- Backend is running on wrong port
- Check `proxy_pass` URL in Nginx config

**Issue: Nginx 404 Not Found**
- Nginx is not proxying to backend
- Check Nginx location blocks
- Verify backend is running

### 9. Quick Fix Commands

```bash
# Restart everything
pm2 restart aethergens-website
sudo systemctl restart nginx

# Check status
pm2 status
sudo systemctl status nginx

# View logs
pm2 logs aethergens-website --lines 50
sudo tail -50 /var/log/nginx/error.log
```

### 10. Verify Installation

```bash
# Check Node.js version (needs 18+)
node -v

# Check if dependencies are installed
ls node_modules | head

# Check if frontend is built
ls dist | head

# Rebuild if needed
npm run build
```

