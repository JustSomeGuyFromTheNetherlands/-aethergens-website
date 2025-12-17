# Vercel Deployment Guide

## Setup

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or connect your GitHub repo to Vercel dashboard.

## Environment Variables

Set these in Vercel dashboard → Settings → Environment Variables:

- `MAILJET_API_KEY` - Mailjet API key (optional)
- `MAILJET_API_SECRET` - Mailjet API secret (optional)
- `MAILJET_FROM_EMAIL` - Email sender address
- `ADMIN_EMAIL` - Admin email for notifications

## Important Notes

- **API Routes**: All `/api/*` routes are handled by `api/index.js` serverless function
- **Static Files**: Frontend is built and served as static files
- **Database**: Uses JSON files in `server/data/` (persisted via Vercel's file system)
- **Build**: Runs `npm run build` automatically on deploy

## File Structure

```
/
├── api/
│   └── index.js          # Serverless API function
├── server/
│   ├── database.js        # Database logic
│   └── mailjet.js         # Email service
├── src/                   # React frontend
├── dist/                  # Built frontend (generated)
└── vercel.json            # Vercel configuration
```

## Troubleshooting

- **API not working**: Check `vercel.json` routes configuration
- **Build fails**: Check Node.js version (needs 18+)
- **Data not persisting**: Vercel file system is read-only in serverless, consider using a database service

