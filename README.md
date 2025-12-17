# AetherGens Website

A modern, responsive website for the AetherGens Minecraft server built with React and Tailwind CSS.

## Features

- Modern, responsive design
- Admin panel for content management
- Static JSON-based data storage
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
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

## Development

```bash
npm install
npm run dev
```

## Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

## Admin Panel

Go to `/admin` and use password: `ik hou van kaas`

**Important:** The admin panel downloads JSON files when you save changes. You must manually upload these downloaded files to the `public/data/` folder on your Vercel deployment.

## Data Storage

All data is stored in static JSON files in the `public/data/` directory:

- `server_info.json` - Server information
- `news.json` - News posts
- `changelog.json` - Server updates
- `gallery.json` - Gallery images
- `shop_items.json` - Shop items
- `features.json` - Server features
- `rules.json` - Server rules
- `staff.json` - Staff members
- `faq.json` - FAQ entries
- `events.json` - Events
- `staff_ranks.json` - Staff positions
- `staff_applications.json` - Staff applications
- `mailjet_config.json` - Mailjet API configuration (gitignored for security)

## Mailjet Configuration

⚠️ **Note:** Since this is a pure client-side application, email functionality (Mailjet) requires server-side code. The `mailjet_config.json` file is provided for reference only. To enable email notifications for staff applications, you would need to add a serverless function or backend API.

To configure Mailjet if you add server functionality:
1. Get your API key and secret from Mailjet dashboard
2. Update the `mailjet_config.json` file with your credentials
3. Implement server-side email sending functionality

## How to Edit Content

1. Go to `/admin` with password `ik hou van kaas`
2. Make your changes in the admin panel
3. When you save, JSON files will be downloaded
4. Upload the downloaded JSON files to `public/data/` on your Vercel deployment
5. Changes will be live immediately
