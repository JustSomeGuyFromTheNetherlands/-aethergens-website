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

