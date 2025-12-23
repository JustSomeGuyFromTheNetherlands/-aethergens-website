const mysql = require('mysql2/promise');
const config = require('./config');
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.pool = null;
    this.connectionCount = 0;
    this.maxRetries = 3;
    this.connect();
  }

  async connect() {
    const poolConfig = {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      charset: config.db.charset,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      queueLimit: config.db.queueLimit
    };

    try {
      this.pool = mysql.createPool(poolConfig);
      this.connectionCount++;
      
      // Test connection
      const connection = await this.pool.getConnection();
      await connection.query("SET time_zone = '+00:00'");
      await connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
      connection.release();
      
      this.log('Database connected successfully');
    } catch (error) {
      this.logError(`Database connection failed: ${error.message}`);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      // Basic SQL injection protection
      if (!params.length && /DROP|TRUNCATE|DELETE FROM/i.test(sql.trim())) {
        throw new Error('Potentially dangerous query detected');
      }

      if (config.debug) {
        this.logQuery(sql, params);
      }

      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      this.logError(`Query error: ${error.message} | SQL: ${sql.substring(0, 200)}`);
      
      if (config.env === 'production') {
        throw new Error('Database query failed');
      }
      throw error;
    }
  }

  async fetchAll(sql, params = []) {
    return await this.query(sql, params);
  }

  async fetchOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async insert(table, data) {
    const tableName = this.sanitizeIdentifier(table);
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const fieldNames = fields.map(f => `\`${this.sanitizeIdentifier(f)}\``).join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO \`${tableName}\` (${fieldNames}) VALUES (${placeholders})`;
    const result = await this.query(sql, values);
    
    // Get last insert ID
    const [rows] = await this.pool.execute('SELECT LAST_INSERT_ID() as id');
    return rows[0].id;
  }

  async update(table, data, where, whereParams = []) {
    const tableName = this.sanitizeIdentifier(table);
    const set = Object.keys(data).map(field => `\`${this.sanitizeIdentifier(field)}\` = ?`).join(', ');
    const values = [...Object.values(data), ...whereParams];

    const sql = `UPDATE \`${tableName}\` SET ${set} WHERE ${where}`;
    const result = await this.query(sql, values);
    return result.affectedRows;
  }

  async delete(table, where, params = []) {
    const tableName = this.sanitizeIdentifier(table);
    const sql = `DELETE FROM \`${tableName}\` WHERE ${where}`;
    const result = await this.query(sql, params);
    return result.affectedRows;
  }

  async beginTransaction() {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  async commit(connection) {
    await connection.commit();
    connection.release();
  }

  async rollback(connection) {
    await connection.rollback();
    connection.release();
  }

  sanitizeIdentifier(identifier) {
    return identifier.replace(/[^a-zA-Z0-9_]/g, '');
  }

  logQuery(sql, params = []) {
    if (!config.debug) return;
    
    const log = {
      time: new Date().toISOString(),
      sql: sql.substring(0, 500),
      params
    };
    
    const logFile = path.join(config.logPath, 'queries.log');
    fs.appendFileSync(logFile, JSON.stringify(log) + '\n');
  }

  logError(message) {
    const log = `${new Date().toISOString()} - ${message}\n`;
    const logFile = path.join(config.logPath, 'database-errors.log');
    fs.appendFileSync(logFile, log);
  }

  log(message) {
    if (config.debug) {
      console.log(`[DB] ${message}`);
    }
  }

  async getStats() {
    const [rows] = await this.pool.execute('SELECT VERSION() as version');
    return {
      connection_count: this.connectionCount,
      server_version: rows[0].version
    };
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// Singleton instance
let instance = null;

function getDB() {
  if (!instance) {
    instance = new Database();
  }
  return instance;
}

module.exports = { Database, getDB };

