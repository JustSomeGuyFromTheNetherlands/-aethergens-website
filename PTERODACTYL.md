# Pterodactyl Panel Setup

## Configuration

### Startup Command
```
npm run start:pterodactyl
```

Or simply:
```
node server/index.js
```

### Environment Variables (Optional)
- `SERVER_PORT` - Port from Pterodactyl (auto-detected)
- `SERVER_IP` - IP from Pterodactyl (defaults to 0.0.0.0)
- `NODE_ENV` - Set to `production` for production build
- `MAILJET_API_KEY` - Mailjet API key (optional)
- `MAILJET_API_SECRET` - Mailjet API secret (optional)
- `MAILJET_FROM_EMAIL` - Email sender address
- `ADMIN_EMAIL` - Admin email for notifications

## Important Notes

- **Port**: Pterodactyl automatically sets `SERVER_PORT` - the server will use this
- **IP Binding**: Server listens on `0.0.0.0` by default to accept external connections
- **Single Port**: Only one port is needed (the one Pterodactyl assigns)
- **Development Mode**: Uses `npm start` which runs both frontend (3000) and backend (3001)
- **Production Mode**: Set `NODE_ENV=production` and run `npm run build` first

## Troubleshooting

- **Can't connect**: Make sure the server is listening on `0.0.0.0` (check logs)
- **Port errors**: Pterodactyl should set `SERVER_PORT` automatically
- **Frontend not loading**: In production, make sure `npm run build` was run first

