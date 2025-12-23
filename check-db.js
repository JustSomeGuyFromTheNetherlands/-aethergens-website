const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'servercrm'
    });

    console.log('Connected to database');

    // Show tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nTables in database:');
    tables.forEach(table => {
      console.log('- ' + Object.values(table)[0]);
    });

    // Check if users table exists and has data
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`\nUsers table has ${users[0].count} records`);
    } catch (err) {
      console.log('\nUsers table does not exist or is empty');
    }

    // Check if server_settings table exists and has data
    try {
      const [settings] = await connection.execute('SELECT * FROM server_settings LIMIT 1');
      if (settings.length > 0) {
        console.log('\nServer settings:', settings[0]);
      } else {
        console.log('\nServer settings table exists but is empty');
      }
    } catch (err) {
      console.log('\nServer settings table does not exist');
    }

  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDB();
