const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'servercrm',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  charset: process.env.DB_CHARSET || 'utf8mb4'
};

const isBrowser = typeof window !== 'undefined' || process.argv.includes('--browser');

async function install() {
  let connection;
  
  try {
    // Connect to MySQL database
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: config.charset
    });
    
    console.log(`✓ Connected to database: ${config.database}\n`);
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove single-line comments (-- comments)
    let cleanSchema = schema.replace(/^--.*$/gm, '');
    
    // Split by semicolon, but keep multi-line statements together
    const statements = [];
    let currentStatement = '';
    const lines = cleanSchema.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('--')) continue;
      
      currentStatement += line + '\n';
      
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt.length > 10 && stmt.toUpperCase().includes('CREATE TABLE')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const statement of statements) {
      try {
        await connection.query(statement);
        const tableMatch = statement.match(/CREATE TABLE.*IF NOT EXISTS.*[`']?(\w+)[`']?/i) || 
                          statement.match(/CREATE TABLE.*[`']?(\w+)[`']?/i);
        if (tableMatch) {
          const tableName = tableMatch[1];
          console.log(`✓ Created table: ${tableName}`);
          created++;
        }
      } catch (error) {
        if (error.message.includes('already exists') || error.code === 'ER_TABLE_EXISTS_ERROR') {
          const tableMatch = statement.match(/CREATE TABLE.*IF NOT EXISTS.*[`']?(\w+)[`']?/i) || 
                            statement.match(/CREATE TABLE.*[`']?(\w+)[`']?/i);
          if (tableMatch) {
            const tableName = tableMatch[1];
            console.log(`⊘ Table already exists: ${tableName}`);
            skipped++;
          }
        } else {
          errors++;
          const tableMatch = statement.match(/CREATE TABLE.*IF NOT EXISTS.*[`']?(\w+)[`']?/i) || 
                            statement.match(/CREATE TABLE.*[`']?(\w+)[`']?/i);
          const tableName = tableMatch ? tableMatch[1] : 'unknown';
          console.error(`✗ Error creating table ${tableName}: ${error.message}`);
          console.error(`   SQL: ${statement.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`\n✓ Tables created: ${created}`);
    console.log(`⊘ Tables skipped: ${skipped}`);
    if (errors > 0) {
      console.error(`✗ Errors: ${errors}`);
    }
    console.log('');
    
    // Migrate existing bans table to support IP bans
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'bans'
      `, [config.database]);
      
      const columnNames = columns.map(c => c.COLUMN_NAME);
      
      if (!columnNames.includes('ban_type')) {
        await connection.execute(`
          ALTER TABLE \`bans\` 
          ADD COLUMN \`ban_type\` VARCHAR(20) DEFAULT 'player' AFTER \`id\`,
          ADD INDEX \`idx_ban_type\` (\`ban_type\`)
        `);
        console.log('✓ Added ban_type column to bans table');
      }
      
      if (!columnNames.includes('ip_address')) {
        await connection.execute(`
          ALTER TABLE \`bans\` 
          ADD COLUMN \`ip_address\` VARCHAR(45) NULL AFTER \`player_uuid\`,
          ADD INDEX \`idx_ip_address\` (\`ip_address\`)
        `);
        console.log('✓ Added ip_address column to bans table');
      }
      
      // Update existing bans
      await connection.execute("UPDATE `bans` SET `ban_type` = 'player' WHERE `ban_type` IS NULL");
      
      // Make player_username nullable for IP bans
      try {
        await connection.execute(`
          ALTER TABLE \`bans\` 
          MODIFY COLUMN \`player_username\` VARCHAR(16) NULL
        `);
        console.log('✓ Updated bans table schema for IP ban support');
      } catch (error) {
        // Column might already be nullable, ignore
      }
    } catch (error) {
      console.error(`⊘ Migration check skipped: ${error.message}`);
    }
    
    // Migrate users table to add email column if needed
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'users'
      `, [config.database]);
      
      const columnNames = columns.map(c => c.COLUMN_NAME);
      
      if (!columnNames.includes('email')) {
        await connection.execute(`
          ALTER TABLE \`users\` 
          ADD COLUMN \`email\` VARCHAR(255) NULL AFTER \`username\`,
          ADD INDEX \`idx_email\` (\`email\`)
        `);
        console.log('✓ Added email column to users table');
      }
    } catch (error) {
      console.error(`⊘ User migration check skipped: ${error.message}`);
    }
    
    // Create wall_of_fame table if it doesn't exist
    try {
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'wall_of_fame'
      `, [config.database]);

      if (tables.length === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS \`wall_of_fame\` (
            \`id\` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            \`player_username\` VARCHAR(16) NOT NULL,
            \`achievement\` VARCHAR(255) NOT NULL,
            \`description\` TEXT,
            \`featured\` TINYINT(1) DEFAULT 0,
            \`created_by\` VARCHAR(16) NOT NULL,
            \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_player_username\` (\`player_username\`),
            KEY \`idx_featured\` (\`featured\`),
            KEY \`idx_created_at\` (\`created_at\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created wall_of_fame table');
      }
    } catch (error) {
      console.error(`⊘ Wall of Fame table check skipped: ${error.message}`);
    }

    // Create changelog table if it doesn't exist
    try {
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'changelog'
      `, [config.database]);

      if (tables.length === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS \`changelog\` (
            \`id\` int(11) NOT NULL AUTO_INCREMENT,
            \`version\` varchar(20) NOT NULL,
            \`title\` varchar(255) NOT NULL,
            \`description\` text,
            \`release_date\` datetime NOT NULL,
            \`is_major\` tinyint(1) NOT NULL DEFAULT 0,
            \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_version\` (\`version\`),
            KEY \`idx_release_date\` (\`release_date\`),
            KEY \`idx_major\` (\`is_major\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created changelog table');

        // Insert default changelog entries
        await connection.execute(`
          INSERT INTO \`changelog\` (\`version\`, \`title\`, \`description\`, \`release_date\`, \`is_major\`) VALUES
          ('1.0.0', 'Initial Release', 'Complete rewrite of AetherGens CMS in Node.js with modern features and improved performance.', '2024-12-23 00:00:00', 1),
          ('1.0.1', 'Bug Fixes & Improvements', 'Fixed various UI bugs, improved error handling, and enhanced security features.', '2024-12-23 00:00:00', 0)
        `);
        console.log('✓ Added default changelog entries');
      }
    } catch (error) {
      console.error(`⊘ Changelog table check skipped: ${error.message}`);
    }

    // Create blog tables if they don't exist
    try {
      // Blog Categories
      const [categoryTables] = await connection.execute(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'blog_categories'
      `, [config.database]);

      if (categoryTables.length === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS \`blog_categories\` (
            \`id\` int(11) NOT NULL AUTO_INCREMENT,
            \`name\` varchar(100) NOT NULL,
            \`slug\` varchar(100) NOT NULL,
            \`description\` text,
            \`color\` varchar(7) DEFAULT '#667eea',
            \`icon\` varchar(50) DEFAULT 'fas fa-folder',
            \`sort_order\` int(11) DEFAULT 0,
            \`active\` tinyint(1) NOT NULL DEFAULT 1,
            \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`unique_slug\` (\`slug\`),
            KEY \`idx_active\` (\`active\`),
            KEY \`idx_sort_order\` (\`sort_order\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created blog_categories table');

        // Insert default categories
        await connection.execute(`
          INSERT INTO \`blog_categories\` (\`name\`, \`slug\`, \`description\`, \`color\`, \`icon\`, \`sort_order\`) VALUES
          ('News', 'news', 'Server news and announcements', '#10b981', 'fas fa-newspaper', 1),
          ('Updates', 'updates', 'Game updates and changes', '#3b82f6', 'fas fa-sync-alt', 2),
          ('Events', 'events', 'Server events and competitions', '#f59e0b', 'fas fa-calendar-alt', 3),
          ('Tutorials', 'tutorials', 'How-to guides and tutorials', '#8b5cf6', 'fas fa-graduation-cap', 4),
          ('Community', 'community', 'Community spotlights and stories', '#ef4444', 'fas fa-users', 5)
        `);
        console.log('✓ Added default blog categories');
      }

      // Blog Posts
      const [postTables] = await connection.execute(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'blog_posts'
      `, [config.database]);

      if (postTables.length === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS \`blog_posts\` (
            \`id\` int(11) NOT NULL AUTO_INCREMENT,
            \`title\` varchar(255) NOT NULL,
            \`slug\` varchar(255) NOT NULL,
            \`excerpt\` text,
            \`content\` longtext NOT NULL,
            \`featured_image\` varchar(500),
            \`category_id\` int(11),
            \`author_id\` int(11) NOT NULL,
            \`status\` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
            \`published_at\` datetime,
            \`views\` int(11) DEFAULT 0,
            \`likes\` int(11) DEFAULT 0,
            \`comments_enabled\` tinyint(1) NOT NULL DEFAULT 1,
            \`seo_title\` varchar(255),
            \`seo_description\` text,
            \`seo_keywords\` text,
            \`tags\` text,
            \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`unique_slug\` (\`slug\`),
            KEY \`idx_category_id\` (\`category_id\`),
            KEY \`idx_author_id\` (\`author_id\`),
            KEY \`idx_status\` (\`status\`),
            KEY \`idx_published_at\` (\`published_at\`),
            KEY \`idx_views\` (\`views\`),
            CONSTRAINT \`fk_blog_posts_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`blog_categories\` (\`id\`) ON DELETE SET NULL,
            CONSTRAINT \`fk_blog_posts_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created blog_posts table');
      }

      // Blog Comments
      const [commentTables] = await connection.execute(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'blog_comments'
      `, [config.database]);

      if (commentTables.length === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS \`blog_comments\` (
            \`id\` int(11) NOT NULL AUTO_INCREMENT,
            \`post_id\` int(11) NOT NULL,
            \`author_name\` varchar(100) NOT NULL,
            \`author_email\` varchar(255),
            \`content\` text NOT NULL,
            \`status\` enum('pending','approved','spam','trash') NOT NULL DEFAULT 'pending',
            \`parent_id\` int(11),
            \`ip_address\` varchar(45),
            \`user_agent\` text,
            \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_post_id\` (\`post_id\`),
            KEY \`idx_status\` (\`status\`),
            KEY \`idx_parent_id\` (\`parent_id\`),
            KEY \`idx_created_at\` (\`created_at\`),
            CONSTRAINT \`fk_blog_comments_post\` FOREIGN KEY (\`post_id\`) REFERENCES \`blog_posts\` (\`id\`) ON DELETE CASCADE,
            CONSTRAINT \`fk_blog_comments_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`blog_comments\` (\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created blog_comments table');
      }

      // Blog Tags
      const [tagTables] = await connection.execute(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'blog_tags'
      `, [config.database]);

      if (tagTables.length === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS \`blog_tags\` (
            \`id\` int(11) NOT NULL AUTO_INCREMENT,
            \`name\` varchar(50) NOT NULL,
            \`slug\` varchar(50) NOT NULL,
            \`color\` varchar(7) DEFAULT '#6c757d',
            \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`unique_slug\` (\`slug\`),
            KEY \`idx_name\` (\`name\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created blog_tags table');

        // Insert default tags
        await connection.execute(`
          INSERT INTO \`blog_tags\` (\`name\`, \`slug\`, \`color\`) VALUES
          ('Minecraft', 'minecraft', '#62b36f'),
          ('Server', 'server', '#3b82f6'),
          ('Event', 'event', '#f59e0b'),
          ('Tutorial', 'tutorial', '#8b5cf6'),
          ('Announcement', 'announcement', '#ef4444'),
          ('Competition', 'competition', '#f97316'),
          ('Update', 'update', '#06b6d4')
        `);
        console.log('✓ Added default blog tags');
      }

      // Blog Post Tags Junction
      const [postTagTables] = await connection.execute(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'blog_post_tags'
      `, [config.database]);

      if (postTagTables.length === 0) {
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS \`blog_post_tags\` (
            \`post_id\` int(11) NOT NULL,
            \`tag_id\` int(11) NOT NULL,
            PRIMARY KEY (\`post_id\`,\`tag_id\`),
            KEY \`idx_post_id\` (\`post_id\`),
            KEY \`idx_tag_id\` (\`tag_id\`),
            CONSTRAINT \`fk_post_tags_post\` FOREIGN KEY (\`post_id\`) REFERENCES \`blog_posts\` (\`id\`) ON DELETE CASCADE,
            CONSTRAINT \`fk_post_tags_tag\` FOREIGN KEY (\`tag_id\`) REFERENCES \`blog_tags\` (\`id\`) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created blog_post_tags table');
      }
    } catch (error) {
      console.error(`⊘ Blog tables check skipped: ${error.message}`);
    }
    
    // Initialize default server settings
    try {
      const [rows] = await connection.execute("SELECT COUNT(*) as count FROM server_settings");
      const count = rows[0].count;
      
      if (count === 0) {
        await connection.execute(
          "INSERT INTO server_settings (server_name, server_ip, server_port, status_message) VALUES (?, ?, ?, ?)",
          ['Minecraft Server', 'play.example.com', 25565, 'Server Online']
        );
        console.log('✓ Default server settings created');
      } else {
        console.log('⊘ Server settings already exist');
      }
    } catch (error) {
      console.error(`✗ Could not create default settings: ${error.message}`);
    }
    
    console.log('\n✓ Installation complete!');
    
  } catch (error) {
    console.error(`✗ Installation failed: ${error.message}`);
    console.error('\nMake sure:');
    console.error(`- Database "${config.database}" exists`);
    console.error(`- User "${config.user}" has CREATE TABLE permissions`);
    console.error('- Database credentials in .env are correct');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run installation
if (require.main === module) {
  install().catch(console.error);
}

module.exports = { install };

