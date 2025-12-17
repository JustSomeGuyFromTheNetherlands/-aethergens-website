# AetherGens Website

Minecraft server website voor AetherGens met admin panel.

## GitHub Setup

Zie [GITHUB.md](GITHUB.md) voor instructies om dit project naar GitHub te pushen.

## Local Development

### Installatie
```bash
npm install
```

### Starten
**Start beide servers tegelijk:**
```bash
npm start
```

Of start ze apart:
- Terminal 1 - Frontend: `npm run dev`
- Terminal 2 - Backend: `npm run server`

## VPS Deployment

Zie [DEPLOY.md](DEPLOY.md) voor volledige deployment instructies.

**Quick deploy:**
```bash
chmod +x install.sh
./install.sh
npm run build
NODE_ENV=production npm run start:prod
```

Of met PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

## Admin Panel

Ga naar `/admin` en gebruik het wachtwoord: `ik hou van kaas`

## Data Storage

Data wordt opgeslagen in JSON bestanden in `server/data/` directory.

