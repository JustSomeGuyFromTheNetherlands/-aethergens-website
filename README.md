# AetherGens PHP Version

A modern Minecraft server website built with PHP, HTML, CSS, and SQLite.

## Features

- Modern, responsive design with Tailwind CSS
- Admin panel for content management
- SQLite database for data storage
- Server information display
- News and changelog sections
- Gallery with image management
- Shop integration with Tebex
- Staff management system
- FAQ section
- Events system
- Staff applications with custom questions

## Installation

1. Upload files to your web server
2. Make sure PHP 7.4+ is installed with PDO SQLite extension
3. Set proper permissions on the `data/` directory (755)
4. Access `index.php` in your browser

The database will be automatically created and populated with default data on first access.

## Admin Panel

Go to `admin/index.php` and use password: `ik hou van kaas`

## File Structure

```
php-version/
├── includes/          # Shared PHP files
│   ├── database.php   # Database functions
│   ├── header.php     # HTML head and navigation
│   └── footer.php     # Footer and scripts
├── admin/            # Admin panel
│   ├── index.php     # Login page
│   ├── panel.php     # Admin dashboard
│   └── logout.php    # Logout script
├── data/             # SQLite database
├── css/              # Custom styles
├── js/               # JavaScript files
├── index.php         # Home page
├── apply.php         # Staff application page
└── README.md
```

## Data Storage

All data is stored in SQLite database (`data/aethergens.db`):

- Server settings and information
- News posts, changelog, gallery images
- Staff members, FAQ, events
- Staff applications and ranks

## Customization

- Edit `includes/header.php` and `includes/footer.php` for global changes
- Modify database schema in `includes/database.php`
- Update styles by editing the Tailwind classes in templates
- Add new pages by following the existing structure

## Security Notes

- Change the admin password in `admin/index.php`
- The database file contains all site data - keep it secure
- Consider using HTTPS in production
- Regular backups of the `data/` directory are recommended
