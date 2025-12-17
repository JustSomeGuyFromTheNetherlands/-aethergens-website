import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Detect Vercel/serverless environment
const isVercel = !!(process.env.VERCEL || 
                    process.env.VERCEL_ENV || 
                    process.env.VERCEL_URL ||
                    (typeof __dirname === 'string' && __dirname.indexOf('/var/task') !== -1))

// Determine database path
let dbPath
if (isVercel || (typeof __dirname === 'string' && __dirname.indexOf('/var/task') !== -1)) {
  // Use /tmp in serverless environments (Vercel allows writes to /tmp)
  dbPath = '/tmp/aethergens.db'
  console.log('🌐 Serverless environment detected - using /tmp for database')
} else {
  dbPath = path.join(__dirname, 'aethergens.db')
}

let db = null

// Initialize database connection
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Database connection error:', err)
        throw err
      }
      console.log(`✅ Connected to SQLite database: ${dbPath}`)
    })
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON')
  }
  return db
}

// Promisify database methods
const dbRun = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

const dbGet = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

const dbAll = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows || [])
    })
  })
}

// Initialize database schema
export function initDatabase() {
  try {
    const database = getDatabase()
    
    // Create tables
    database.serialize(() => {
      // Server Info
      database.run(`CREATE TABLE IF NOT EXISTS server_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        online_players INTEGER DEFAULT 0,
        version TEXT DEFAULT '1.20+',
        description TEXT,
        server_ip TEXT DEFAULT 'play.aethergens.com',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)
      
      // News
      database.run(`CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)
      
      // Changelog
      database.run(`CREATE TABLE IF NOT EXISTS changelog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL,
        changes TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)
      
      // Gallery
      database.run(`CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        image_url TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)
      
      // Shop Items
      database.run(`CREATE TABLE IF NOT EXISTS shop_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        tebex_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)
      
      // Features
      database.run(`CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT,
        order_index INTEGER DEFAULT 0
      )`)
      
      // Rules
      database.run(`CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0
      )`)
      
      // Staff
      database.run(`CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rank TEXT NOT NULL,
        role TEXT,
        avatar_url TEXT,
        order_index INTEGER DEFAULT 0
      )`)
      
      // FAQ
      database.run(`CREATE TABLE IF NOT EXISTS faq (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        order_index INTEGER DEFAULT 0
      )`)
      
      // Events
      database.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date DATETIME NOT NULL,
        location TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)
      
      // Staff Ranks
      database.run(`CREATE TABLE IF NOT EXISTS staff_ranks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        questions TEXT, -- JSON array of question objects
        open INTEGER DEFAULT 1, -- 1 = open, 0 = closed
        order_index INTEGER DEFAULT 0
      )`)
      
      // Staff Applications
      database.run(`CREATE TABLE IF NOT EXISTS staff_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rank_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        minecraft_username TEXT NOT NULL,
        discord_username TEXT,
        answers TEXT, -- JSON object with answers to custom questions
        status TEXT DEFAULT 'pending', -- pending, approved, rejected
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rank_id) REFERENCES staff_ranks(id)
      )`)
      
      // Insert default data if tables are empty
      dbGet(database, 'SELECT COUNT(*) as count FROM server_info').then(result => {
        if (result.count === 0) {
          dbRun(database, `INSERT INTO server_info (online_players, version, description, server_ip) 
            VALUES (?, ?, ?, ?)`, 
            [0, '1.20+', 'Discover a new world full of adventure and possibilities on AetherGens. Build, explore, and enjoy the best Minecraft experience with our custom features, friendly community, and dedicated staff team.', 'play.aethergens.com'])
        }
      }).catch(err => console.error('Error initializing server_info:', err))
      
      dbGet(database, 'SELECT COUNT(*) as count FROM staff_ranks').then(result => {
        if (result.count === 0) {
          const defaultRanks = [
            ['Helper', 'Help new players and moderate the server', JSON.stringify([{ question: 'Why do you want to be a helper?', required: true }]), 1, 1],
            ['Moderator', 'Moderate the server and enforce rules', JSON.stringify([{ question: 'Why do you want to be a moderator?', required: true }]), 1, 2],
            ['Admin', 'Manage the server and staff team', JSON.stringify([{ question: 'Why do you want to be an admin?', required: true }]), 0, 3]
          ]
          defaultRanks.forEach(rank => {
            dbRun(database, `INSERT INTO staff_ranks (name, description, questions, open, order_index) VALUES (?, ?, ?, ?, ?)`, rank)
          })
        }
      }).catch(err => console.error('Error initializing staff_ranks:', err))
      
      console.log('✅ Database initialized successfully')
    })
  } catch (err) {
    console.error('❌ Database initialization error:', err)
    throw err
  }
}

// Server Info
export async function getServerInfo() {
  const database = getDatabase()
  const row = await dbGet(database, 'SELECT * FROM server_info ORDER BY id DESC LIMIT 1')
  if (!row) {
    return { onlinePlayers: 0, version: '1.20+', description: '', serverIp: 'play.aethergens.com' }
  }
  return {
    onlinePlayers: row.online_players || 0,
    version: row.version || '1.20+',
    description: row.description || '',
    serverIp: row.server_ip || 'play.aethergens.com'
  }
}

export async function updateServerInfo(info) {
  const database = getDatabase()
  await dbRun(database, `UPDATE server_info SET 
    online_players = ?, 
    version = ?, 
    description = ?, 
    server_ip = ?,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT id FROM server_info ORDER BY id DESC LIMIT 1)`,
    [info.onlinePlayers || 0, info.version || '1.20+', info.description || '', info.serverIp || 'play.aethergens.com'])
}

// News
export async function getAllNews() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM news ORDER BY created_at DESC')
}

export async function getNewsById(id) {
  const database = getDatabase()
  return await dbGet(database, 'SELECT * FROM news WHERE id = ?', [id])
}

export async function createNews(news) {
  const database = getDatabase()
  const result = await dbRun(database, 
    'INSERT INTO news (title, content, author) VALUES (?, ?, ?)',
    [news.title, news.content, news.author || 'Admin'])
  return result.lastID
}

export async function updateNews(id, news) {
  const database = getDatabase()
  await dbRun(database,
    'UPDATE news SET title = ?, content = ?, author = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [news.title, news.content, news.author || 'Admin', id])
}

export async function deleteNews(id) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM news WHERE id = ?', [id])
}

// Changelog
export async function getAllChangelog() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM changelog ORDER BY date DESC')
}

export async function createChangelog(changelog) {
  const database = getDatabase()
  const result = await dbRun(database,
    'INSERT INTO changelog (version, changes) VALUES (?, ?)',
    [changelog.version, changelog.changes])
  return result.lastID
}

export async function updateChangelog(id, changelog) {
  const database = getDatabase()
  await dbRun(database,
    'UPDATE changelog SET version = ?, changes = ? WHERE id = ?',
    [changelog.version, changelog.changes, id])
}

export async function deleteChangelog(id) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM changelog WHERE id = ?', [id])
}

// Gallery
export async function getAllGallery() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM gallery ORDER BY created_at DESC')
}

export async function createGalleryItem(item) {
  const database = getDatabase()
  const result = await dbRun(database,
    'INSERT INTO gallery (title, image_url, description) VALUES (?, ?, ?)',
    [item.title, item.imageUrl, item.description || ''])
  return result.lastID
}

export async function updateGalleryItem(id, item) {
  const database = getDatabase()
  await dbRun(database,
    'UPDATE gallery SET title = ?, image_url = ?, description = ? WHERE id = ?',
    [item.title, item.imageUrl, item.description || '', id])
}

export async function deleteGalleryItem(id) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM gallery WHERE id = ?', [id])
}

// Shop Items
export async function getAllShopItems() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM shop_items ORDER BY created_at DESC')
}

export async function createShopItem(item) {
  const database = getDatabase()
  const result = await dbRun(database,
    'INSERT INTO shop_items (name, description, price, image_url, tebex_link) VALUES (?, ?, ?, ?, ?)',
    [item.name, item.description || '', item.price, item.imageUrl || '', item.tebexLink || ''])
  return result.lastID
}

export async function updateShopItem(id, item) {
  const database = getDatabase()
  await dbRun(database,
    'UPDATE shop_items SET name = ?, description = ?, price = ?, image_url = ?, tebex_link = ? WHERE id = ?',
    [item.name, item.description || '', item.price, item.imageUrl || '', item.tebexLink || '', id])
}

export async function deleteShopItem(id) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM shop_items WHERE id = ?', [id])
}

// Features
export async function getAllFeatures() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM features ORDER BY order_index ASC')
}

export async function updateFeatures(features) {
  const database = getDatabase()
  // Delete all and reinsert
  await dbRun(database, 'DELETE FROM features')
  for (const feature of features) {
    await dbRun(database,
      'INSERT INTO features (title, description, icon, order_index) VALUES (?, ?, ?, ?)',
      [feature.title, feature.description, feature.icon || '', feature.orderIndex || 0])
  }
}

// Rules
export async function getAllRules() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM rules ORDER BY order_index ASC')
}

export async function updateRules(rules) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM rules')
  for (const rule of rules) {
    await dbRun(database,
      'INSERT INTO rules (rule, description, order_index) VALUES (?, ?, ?)',
      [rule.rule, rule.description || '', rule.orderIndex || 0])
  }
}

// Staff
export async function getAllStaff() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM staff ORDER BY order_index ASC')
}

export async function updateStaff(staff) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM staff')
  for (const member of staff) {
    await dbRun(database,
      'INSERT INTO staff (name, rank, role, avatar_url, order_index) VALUES (?, ?, ?, ?, ?)',
      [member.name, member.rank, member.role || '', member.avatarUrl || '', member.orderIndex || 0])
  }
}

// FAQ
export async function getAllFAQ() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM faq ORDER BY order_index ASC')
}

export async function updateFAQ(faq) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM faq')
  for (const item of faq) {
    await dbRun(database,
      'INSERT INTO faq (question, answer, order_index) VALUES (?, ?, ?)',
      [item.question, item.answer, item.orderIndex || 0])
  }
}

// Events
export async function getAllEvents() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM events ORDER BY date ASC')
}

export async function getEventById(id) {
  const database = getDatabase()
  return await dbGet(database, 'SELECT * FROM events WHERE id = ?', [id])
}

export async function createEvent(event) {
  const database = getDatabase()
  const result = await dbRun(database,
    'INSERT INTO events (title, description, date, location, image_url) VALUES (?, ?, ?, ?, ?)',
    [event.title, event.description, event.date, event.location || '', event.imageUrl || ''])
  return result.lastID
}

export async function updateEvent(id, event) {
  const database = getDatabase()
  await dbRun(database,
    'UPDATE events SET title = ?, description = ?, date = ?, location = ?, image_url = ? WHERE id = ?',
    [event.title, event.description, event.date, event.location || '', event.imageUrl || '', id])
}

export async function deleteEvent(id) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM events WHERE id = ?', [id])
}

// Staff Ranks
export async function getAllStaffRanks() {
  const database = getDatabase()
  const ranks = await dbAll(database, 'SELECT * FROM staff_ranks ORDER BY order_index ASC')
  return ranks.map(rank => ({
    id: rank.id,
    name: rank.name,
    description: rank.description || '',
    questions: rank.questions ? JSON.parse(rank.questions) : [],
    open: rank.open === 1,
    orderIndex: rank.order_index || 0
  }))
}

export async function getStaffRankById(id) {
  const database = getDatabase()
  const rank = await dbGet(database, 'SELECT * FROM staff_ranks WHERE id = ?', [id])
  if (!rank) return null
  return {
    id: rank.id,
    name: rank.name,
    description: rank.description || '',
    questions: rank.questions ? JSON.parse(rank.questions) : [],
    open: rank.open === 1,
    orderIndex: rank.order_index || 0
  }
}

export async function getOpenStaffRanks() {
  const database = getDatabase()
  const ranks = await dbAll(database, 'SELECT * FROM staff_ranks WHERE open = 1 ORDER BY order_index ASC')
  return ranks.map(rank => ({
    id: rank.id,
    name: rank.name,
    description: rank.description || '',
    questions: rank.questions ? JSON.parse(rank.questions) : [],
    open: true,
    orderIndex: rank.order_index || 0
  }))
}

export async function createStaffRank(rank) {
  const database = getDatabase()
  const result = await dbRun(database,
    'INSERT INTO staff_ranks (name, description, questions, open, order_index) VALUES (?, ?, ?, ?, ?)',
    [rank.name, rank.description || '', JSON.stringify(rank.questions || []), rank.open ? 1 : 0, rank.orderIndex || 0])
  return result.lastID
}

export async function updateStaffRank(id, rank) {
  const database = getDatabase()
  await dbRun(database,
    'UPDATE staff_ranks SET name = ?, description = ?, questions = ?, open = ?, order_index = ? WHERE id = ?',
    [rank.name, rank.description || '', JSON.stringify(rank.questions || []), rank.open ? 1 : 0, rank.orderIndex || 0, id])
}

export async function deleteStaffRank(id) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM staff_ranks WHERE id = ?', [id])
}

// Staff Applications
export async function getAllStaffApplications() {
  const database = getDatabase()
  return await dbAll(database, 'SELECT * FROM staff_applications ORDER BY created_at DESC')
}

export async function getStaffApplicationById(id) {
  const database = getDatabase()
  const app = await dbGet(database, 'SELECT * FROM staff_applications WHERE id = ?', [id])
  if (!app) return null
  return {
    id: app.id,
    rankId: app.rank_id,
    name: app.name,
    email: app.email,
    minecraftUsername: app.minecraft_username,
    discordUsername: app.discord_username || '',
    answers: app.answers ? JSON.parse(app.answers) : {},
    status: app.status || 'pending',
    createdAt: app.created_at
  }
}

export async function createStaffApplication(application) {
  const database = getDatabase()
  const result = await dbRun(database,
    'INSERT INTO staff_applications (rank_id, name, email, minecraft_username, discord_username, answers) VALUES (?, ?, ?, ?, ?, ?)',
    [application.rankId, application.name, application.email, application.minecraftUsername, application.discordUsername || '', JSON.stringify(application.answers || {})])
  return result.lastID
}

export async function updateStaffApplicationStatus(id, status) {
  const database = getDatabase()
  await dbRun(database, 'UPDATE staff_applications SET status = ? WHERE id = ?', [status, id])
}

export async function deleteStaffApplication(id) {
  const database = getDatabase()
  await dbRun(database, 'DELETE FROM staff_applications WHERE id = ?', [id])
}
