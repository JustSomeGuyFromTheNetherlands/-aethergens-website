# AetherGens CMS - Node.js Edition

Minecraft Server CMS rewritten in Node.js/Express.js

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials and settings

4. Run database schema:
   - Option A: Import SQL file directly:
     ```bash
     mysql -u root -p servercrm < database/schema.sql
     ```
   - Option B: Use the installation script (via browser):
     Visit `http://localhost:3000/database/install` after starting the server

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
project_rewritten/
├── config.js              # Configuration
├── database.js             # Database abstraction layer
├── server.js              # Main server file
├── middleware/            # Express middleware
│   ├── auth.js           # Authentication
│   ├── rateLimit.js      # Rate limiting
│   └── security.js       # Security headers
├── routes/                # Route handlers
│   ├── public.js         # Public routes
│   ├── admin.js          # Admin routes
│   └── api/              # API routes
├── utils/                 # Utilities
│   ├── cache.js          # Caching system
│   ├── minecraftQuery.js # Minecraft server querying
│   └── playerTracker.js  # Player tracking
└── views/                 # EJS templates
```

## Features

- Express.js web framework
- MySQL database with connection pooling
- Session-based authentication
- Rate limiting
- Security headers (Helmet, CSP)
- Minecraft server status querying (mcstatus.io API)
- Player tracking (automatic)
- Admin panel (bans, news, players, settings, appeals, applications)
- Public pages (appeal, apply, leaderboard, vote)
- RESTful API (v1)
- Discord webhooks integration
- Mailjet email integration
- RCON server integration
- Bot data file generation
- EJS templating
- Database installation script

## Environment Variables

See `.env.example` for all available configuration options.

## Notes

- Uses the same database schema as the PHP version
- Compatible with existing MySQL database
- Session-based auth (compatible with PHP sessions)
- Uses mcstatus.io API for server status

