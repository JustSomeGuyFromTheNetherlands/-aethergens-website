# AetherGens CMS - Node.js Edition

A full-featured Minecraft Server CMS rewritten in Node.js/Express.js with Joomla-like content management capabilities.

## Features

### Core Features
- **Express.js web framework** with modern architecture
- **MySQL database** with connection pooling
- **Session-based authentication** with security middleware
- **Rate limiting** and comprehensive security headers
- **Real-time Minecraft server status** via mcstatus.io API
- **Automatic player tracking** with detailed statistics
- **RCON integration** for server management
- **Discord webhooks** and email integration

### Content Management System (CMS)
- **Blog System**: Full-featured blog with posts, categories, tags, and comments
- **Changelog Management**: Track version updates and release notes
- **Content Categories**: Organize content with custom categories
- **SEO Optimization**: Meta titles, descriptions, and keywords
- **Rich Text Content**: Support for formatted blog posts
- **Comment System**: User comments with moderation
- **Tag System**: Organize content with tags and filters

### Admin Panel Features
- **Dashboard**: Comprehensive admin dashboard with statistics
- **User Management**: Admin user accounts with role-based access
- **Player Management**: Detailed player statistics and moderation
- **Ban Management**: Advanced ban system with IP ban support
- **News Management**: Create and manage server announcements
- **Store Management**: In-game store with categories and items
- **Settings Management**: Server configuration and customization
- **Analytics**: Server performance and player analytics
- **API Key Management**: Secure API key generation
- **Backup Management**: Server backup utilities
- **File Manager**: Server file management interface
- **Console Access**: Web-based server console
- **Webhook Management**: Discord webhook configuration
- **Social Links**: Manage social media links
- **Wall of Fame**: Community recognition system

### Public Features
- **Server Status**: Real-time server monitoring
- **Player Leaderboards**: Top players by various metrics
- **Voting System**: Multiple voting site integration
- **Application System**: Staff application management
- **Store Interface**: Browse and purchase in-game items
- **News Feed**: Latest server announcements
- **Changelog**: Version history and updates
- **Blog**: Community blog with articles and tutorials
- **Registration**: User account creation
- **Appeal System**: Ban appeal submissions

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

