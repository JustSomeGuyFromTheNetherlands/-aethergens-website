# Docker Deployment Guide

## Quick Start

### Build and Run (Development Mode)
```bash
docker build -t aethergens-website .
docker run -d -p 3000:3000 -p 3001:3001 --name aethergens-website aethergens-website
```

### Using Docker Compose
```bash
docker-compose up -d
```

## Important Notes

**Development Mode (Default):**

- Port 3000 = Frontend (Vite dev server) - **Use this for the website**
- Port 3001 = Backend API
- Hot reload enabled
- No build step needed

## Environment Variables

Create a `.env` file or set in docker-compose.yml:

```env
NODE_ENV=production
PORT=3001
MAILJET_API_KEY=your_key
MAILJET_API_SECRET=your_secret
MAILJET_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

## Volumes

The `server/data` directory is mounted as a volume to persist data:

```yaml
volumes:
  - ./server/data:/app/server/data
```

## Troubleshooting

- **Port 3000 refused**: This is normal! Only use port 3001 in production
- **Frontend not loading**: Make sure `npm run build` was run before building
- **API not working**: Check that NODE_ENV=production is set
- **Data not persisting**: Check volume mount in docker-compose.yml

## Rebuild After Changes

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

