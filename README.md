# AetherGens Website

A modern, responsive website for the AetherGens Minecraft server built with React and Tailwind CSS.

## Quick Install (VPS)

**One-line install:**
```bash
curl -fsSL https://raw.githubusercontent.com/JustSomeGuyFromTheNetherlands/-aethergens-website/main/install.sh | bash
cd aethergens-website
nano .env  # Edit configuration
./start.sh  # Start server
```

**Or manually:**
```bash
git clone https://github.com/JustSomeGuyFromTheNetherlands/-aethergens-website.git
cd aethergens-website
chmod +x install.sh
./install.sh
nano .env
./start.sh
```

## Features

- Modern, responsive design
- Admin panel for content management
- Dynamic content loading
- Server information display
- News and changelog sections
- Gallery
- Shop integration
- Staff management
- FAQ section
- Events system
- Staff applications

## Installation

1. Clone the repository: `git clone https://github.com/JustSomeGuyFromTheNetherlands/-aethergens-website.git`
2. Run install script: `./install.sh`
3. Configure: Edit `.env` file
4. Start server: `./start.sh` or `npm run start:prod`

## Development

Run `npm start` to start both frontend and backend servers simultaneously.

## Production Deployment

See `DEPLOY.md` for VPS deployment instructions.
See `DOCKER.md` for Docker deployment.
See `PTERODACTYL.md` for Pterodactyl panel deployment.

## Admin Panel

Go to `/admin` and use password: `ik hou van kaas`

## Data Storage

Data is stored in JSON files in `server/data/` directory.
