import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Vercel uses /tmp for writable storage, fallback to local data directory
// Detect Vercel/serverless by checking environment variables and path
const isVercel = !!(process.env.VERCEL || 
                    process.env.VERCEL_ENV || 
                    process.env.VERCEL_URL ||
                    (typeof __dirname === 'string' && __dirname.indexOf('/var/task') !== -1))

// Always use /tmp in serverless environments
let dataDir
if (isVercel || (typeof __dirname === 'string' && __dirname.indexOf('/var/task') !== -1)) {
  dataDir = '/tmp/aethergens-data'
  console.log('🌐 Serverless environment detected - using /tmp for data storage')
} else {
  dataDir = path.join(__dirname, 'data')
}

// Ensure data directory exists - wrap in try-catch for safety
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log(`✅ Created data directory: ${dataDir}`)
  }
} catch (err) {
  console.error(`❌ Failed to create data directory ${dataDir}:`, err)
  // Force fallback to /tmp
  if (dataDir !== '/tmp/aethergens-data') {
    console.warn('⚠️  Falling back to /tmp for data storage')
    dataDir = '/tmp/aethergens-data'
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
        console.log(`✅ Created fallback data directory: ${dataDir}`)
      }
    } catch (tmpErr) {
      console.error('❌ Failed to create /tmp directory:', tmpErr)
    }
  }
}

const getFilePath = (table) => path.join(dataDir, `${table}.json`)

const readFile = (table) => {
  try {
    const filePath = getFilePath(table)
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    if (!data || data.trim() === '') {
      return []
    }
    return JSON.parse(data)
  } catch (err) {
    console.error(`Error reading ${table}:`, err)
    return []
  }
}

const writeFile = (table, data) => {
  try {
    const filePath = getFilePath(table)
    // Ensure directory exists
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error(`Error writing ${table}:`, err)
    // In Vercel/serverless, file system is read-only, so we log but don't throw
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      console.warn(`⚠️  Running in serverless environment - file writes disabled for ${table}`)
      return false
    }
    throw err
  }
}

export function initDatabase() {
  try {
    // Initialize default data if files don't exist
    const tables = ['server_info', 'news', 'changelog', 'gallery', 'shop_items', 'features', 'rules', 'staff', 'faq', 'events', 'staff_applications', 'staff_ranks']
    
    tables.forEach(table => {
      try {
        const filePath = getFilePath(table)
        if (!fs.existsSync(filePath)) {
          const written = writeFile(table, [])
          if (!written && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
            console.warn(`⚠️  Could not create ${table}.json in serverless environment`)
          }
        }
      } catch (err) {
        console.error(`Error initializing table ${table}:`, err)
      }
    })
  } catch (err) {
    console.error('Error in initDatabase:', err)
    throw err
  }

  // Set default server info
  const serverInfo = readFile('server_info')
  if (serverInfo.length === 0) {
    writeFile('server_info', [{
      id: 1,
      online_players: 0,
      version: '1.20+',
      description: 'Discover a new world full of adventure and possibilities on AetherGens. Build, explore, and enjoy the best Minecraft experience with our custom features, friendly community, and dedicated staff team.',
      server_ip: 'play.aethergens.com',
      updated_at: new Date().toISOString()
    }])
  }

  // Set default features
  const features = readFile('features')
  if (features.length === 0) {
    writeFile('features', [
      { id: 1, icon: '🏗️', title: 'Custom Generators', description: 'Advanced generator system for unique gameplay', order_index: 0 },
      { id: 2, icon: '💰', title: 'Economy System', description: 'Trade, buy, and sell with our robust economy', order_index: 1 },
      { id: 3, icon: '🎯', title: 'Quests & Rewards', description: 'Complete quests and earn amazing rewards', order_index: 2 },
      { id: 4, icon: '🏠', title: 'Land Protection', description: 'Protect your builds with our land claim system', order_index: 3 },
      { id: 5, icon: '🎨', title: 'Custom Items', description: 'Unique items and weapons to discover', order_index: 4 },
      { id: 6, icon: '👥', title: 'Active Community', description: 'Join our friendly and welcoming community', order_index: 5 },
    ])
  }

  // Set default rules
  const rules = readFile('rules')
  if (rules.length === 0) {
    writeFile('rules', [
      { id: 1, rule_text: 'No griefing or stealing from other players', order_index: 0 },
      { id: 2, rule_text: 'Be respectful to all players and staff members', order_index: 1 },
      { id: 3, rule_text: 'No cheating, hacking, or exploiting glitches', order_index: 2 },
      { id: 4, rule_text: 'No spamming in chat or advertising other servers', order_index: 3 },
      { id: 5, rule_text: 'Keep chat appropriate and family-friendly', order_index: 4 },
      { id: 6, rule_text: 'Follow staff instructions and decisions', order_index: 5 },
      { id: 7, rule_text: 'No inappropriate builds or usernames', order_index: 6 },
      { id: 8, rule_text: 'Report bugs and issues to staff instead of exploiting', order_index: 7 },
    ])
  }

  // Set default staff
  const staff = readFile('staff')
  if (staff.length === 0) {
    writeFile('staff', [
      { id: 1, name: 'Admin', role: 'Owner', color: '#DC2626', order_index: 0 },
      { id: 2, name: 'Moderator', role: 'Admin', color: '#9333EA', order_index: 1 },
      { id: 3, name: 'Helper', role: 'Moderator', color: '#16A34A', order_index: 2 },
      { id: 4, name: 'Architect', role: 'Builder', color: '#1565C0', order_index: 3 },
    ])
  }

  // Set default FAQ
  const faq = readFile('faq')
  if (faq.length === 0) {
    writeFile('faq', [
      { id: 1, question: 'How do I join the server?', answer: 'Simply connect to play.aethergens.com using Minecraft version 1.20 or higher.', order_index: 0 },
      { id: 2, question: 'Is the server free to play?', answer: 'Yes! AetherGens is completely free to play with optional cosmetic donations.', order_index: 1 },
      { id: 3, question: 'What makes AetherGens different?', answer: 'Our custom generator system, active community, and dedicated staff make us unique.', order_index: 2 },
      { id: 4, question: 'How do I report a player?', answer: 'Use /report in-game or contact a staff member directly.', order_index: 3 },
    ])
  }

  // Set default staff ranks
  try {
    const staffRanks = readFile('staff_ranks')
    if (!staffRanks || staffRanks.length === 0) {
      writeFile('staff_ranks', [
        {
          id: 1,
          name: 'Helper',
          description: 'Entry-level staff position. Help players and moderate chat.',
          questions: [
            { question: 'Why do you want to be a Helper?', required: true },
            { question: 'Do you have any previous staff experience?', required: true },
            { question: 'How many hours per week can you dedicate?', required: true }
          ],
          open: 1,
          order_index: 0
        },
        {
          id: 2,
          name: 'Moderator',
          description: 'Moderate the server and handle player disputes.',
          questions: [
            { question: 'Why do you want to be a Moderator?', required: true },
            { question: 'Describe your moderation experience.', required: true },
            { question: 'How would you handle a difficult player situation?', required: true },
            { question: 'What makes you qualified for this position?', required: true }
          ],
          open: 1,
          order_index: 1
        },
        {
          id: 3,
          name: 'Admin',
          description: 'Senior staff position with administrative responsibilities.',
          questions: [
            { question: 'Why do you want to be an Admin?', required: true },
            { question: 'Describe your leadership experience.', required: true },
            { question: 'How would you improve the server?', required: true },
            { question: 'What is your long-term vision for AetherGens?', required: true },
            { question: 'Have you managed a team before?', required: true }
          ],
          open: 0,
          order_index: 2
        },
        {
          id: 4,
          name: 'Manager',
          description: 'Highest staff position. Oversee all server operations.',
          questions: [
            { question: 'Why do you want to be a Manager?', required: true },
            { question: 'Describe your management experience.', required: true },
            { question: 'How would you lead the staff team?', required: true },
            { question: 'What is your strategic vision for the server?', required: true },
            { question: 'How would you handle conflicts within the staff team?', required: true },
            { question: 'What changes would you implement?', required: true }
          ],
          open: 0,
          order_index: 3
        }
      ])
    }
  } catch (err) {
    console.error('Error initializing staff ranks:', err)
  }

  console.log('JSON database initialized successfully')
}

// Server Info
export function getServerInfo() {
  return new Promise((resolve) => {
    const data = readFile('server_info')
    const info = data[0] || {}
    resolve({
      onlinePlayers: info.online_players || 0,
      version: info.version || '1.20+',
      description: info.description || '',
      serverIp: info.server_ip || 'play.aethergens.com'
    })
  })
}

export function updateServerInfo(onlinePlayers, version, description, serverIp) {
  const data = readFile('server_info')
  if (data.length > 0) {
    data[0].online_players = onlinePlayers
    data[0].version = version
    data[0].description = description
    data[0].server_ip = serverIp
    data[0].updated_at = new Date().toISOString()
  } else {
    data.push({
      id: 1,
      online_players: onlinePlayers,
      version: version,
      description: description,
      server_ip: serverIp,
      updated_at: new Date().toISOString()
    })
  }
  writeFile('server_info', data)
}

// News
export function getAllNews() {
  return new Promise((resolve) => {
    const data = readFile('news')
    resolve(data.filter(item => item.published === 1).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  })
}

export function getNewsById(id) {
  return new Promise((resolve) => {
    const data = readFile('news')
    resolve(data.find(item => item.id === parseInt(id)))
  })
}

export function createNews(title, content, author, imageUrl, published) {
  return new Promise((resolve) => {
    const data = readFile('news')
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    const newItem = {
      id: newId,
      title,
      content,
      author: author || 'Admin',
      image_url: imageUrl || '',
      published: published !== undefined ? (published ? 1 : 0) : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    data.push(newItem)
    writeFile('news', data)
    resolve(newId)
  })
}

export function updateNews(id, title, content, author, imageUrl, published) {
  return new Promise((resolve) => {
    const data = readFile('news')
    const index = data.findIndex(item => item.id === parseInt(id))
    if (index !== -1) {
      data[index] = {
        ...data[index],
        title,
        content,
        author,
        image_url: imageUrl,
        published: published !== undefined ? (published ? 1 : 0) : 1,
        updated_at: new Date().toISOString()
      }
      writeFile('news', data)
    }
    resolve()
  })
}

export function deleteNews(id) {
  return new Promise((resolve) => {
    const data = readFile('news')
    const filtered = data.filter(item => item.id !== parseInt(id))
    writeFile('news', filtered)
    resolve()
  })
}

// Changelog
export function getAllChangelog() {
  return new Promise((resolve) => {
    const data = readFile('changelog')
    resolve(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  })
}

export function createChangelog(version, title, description, type) {
  return new Promise((resolve) => {
    const data = readFile('changelog')
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    const newItem = {
      id: newId,
      version,
      title,
      description,
      type: type || 'update',
      created_at: new Date().toISOString()
    }
    data.push(newItem)
    writeFile('changelog', data)
    resolve(newId)
  })
}

export function updateChangelog(id, version, title, description, type) {
  return new Promise((resolve) => {
    const data = readFile('changelog')
    const index = data.findIndex(item => item.id === parseInt(id))
    if (index !== -1) {
      data[index] = {
        ...data[index],
        version,
        title,
        description,
        type: type || 'update'
      }
      writeFile('changelog', data)
    }
    resolve()
  })
}

export function deleteChangelog(id) {
  return new Promise((resolve) => {
    const data = readFile('changelog')
    const filtered = data.filter(item => item.id !== parseInt(id))
    writeFile('changelog', filtered)
    resolve()
  })
}

// Gallery
export function getAllGallery() {
  return new Promise((resolve) => {
    const data = readFile('gallery')
    resolve(data.sort((a, b) => {
      if (b.featured !== a.featured) return b.featured - a.featured
      return new Date(b.created_at) - new Date(a.created_at)
    }))
  })
}

export function createGalleryItem(title, imageUrl, description, category, featured) {
  return new Promise((resolve) => {
    const data = readFile('gallery')
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    const newItem = {
      id: newId,
      title,
      image_url: imageUrl,
      description: description || '',
      category: category || 'general',
      featured: featured ? 1 : 0,
      created_at: new Date().toISOString()
    }
    data.push(newItem)
    writeFile('gallery', data)
    resolve(newId)
  })
}

export function updateGalleryItem(id, title, imageUrl, description, category, featured) {
  return new Promise((resolve) => {
    const data = readFile('gallery')
    const index = data.findIndex(item => item.id === parseInt(id))
    if (index !== -1) {
      data[index] = {
        ...data[index],
        title,
        image_url: imageUrl,
        description,
        category,
        featured: featured ? 1 : 0
      }
      writeFile('gallery', data)
    }
    resolve()
  })
}

export function deleteGalleryItem(id) {
  return new Promise((resolve) => {
    const data = readFile('gallery')
    const filtered = data.filter(item => item.id !== parseInt(id))
    writeFile('gallery', filtered)
    resolve()
  })
}

// Shop
export function getAllShopItems() {
  return new Promise((resolve) => {
    const data = readFile('shop_items')
    const filtered = data.filter(item => item.active === 1)
    resolve(filtered.sort((a, b) => {
      if (b.featured !== a.featured) return b.featured - a.featured
      return a.price - b.price
    }))
  })
}

export function createShopItem(name, description, price, category, tebexId, imageUrl, featured, active) {
  return new Promise((resolve) => {
    const data = readFile('shop_items')
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    const newItem = {
      id: newId,
      name,
      description,
      price: parseFloat(price),
      category: category || 'ranks',
      tebex_id: tebexId || '',
      image_url: imageUrl || '',
      featured: featured ? 1 : 0,
      active: active !== undefined ? (active ? 1 : 0) : 1,
      created_at: new Date().toISOString()
    }
    data.push(newItem)
    writeFile('shop_items', data)
    resolve(newId)
  })
}

export function updateShopItem(id, name, description, price, category, tebexId, imageUrl, featured, active) {
  return new Promise((resolve) => {
    const data = readFile('shop_items')
    const index = data.findIndex(item => item.id === parseInt(id))
    if (index !== -1) {
      data[index] = {
        ...data[index],
        name,
        description,
        price: parseFloat(price),
        category,
        tebex_id: tebexId,
        image_url: imageUrl,
        featured: featured ? 1 : 0,
        active: active ? 1 : 0
      }
      writeFile('shop_items', data)
    }
    resolve()
  })
}

export function deleteShopItem(id) {
  return new Promise((resolve) => {
    const data = readFile('shop_items')
    const filtered = data.filter(item => item.id !== parseInt(id))
    writeFile('shop_items', filtered)
    resolve()
  })
}

// Features
export function getAllFeatures() {
  return new Promise((resolve) => {
    const data = readFile('features')
    resolve(data.sort((a, b) => a.order_index - b.order_index))
  })
}

export function updateFeatures(features) {
  return new Promise((resolve) => {
    const updated = features.map((f, idx) => ({
      id: f.id || idx + 1,
      icon: f.icon,
      title: f.title,
      description: f.description,
      order_index: idx,
      created_at: f.created_at || new Date().toISOString()
    }))
    writeFile('features', updated)
    resolve()
  })
}

// Rules
export function getAllRules() {
  return new Promise((resolve) => {
    const data = readFile('rules')
    resolve(data.sort((a, b) => a.order_index - b.order_index))
  })
}

export function updateRules(rules) {
  return new Promise((resolve) => {
    const updated = rules.map((r, idx) => ({
      id: r.id || idx + 1,
      rule_text: r.ruleText,
      order_index: idx,
      created_at: r.created_at || new Date().toISOString()
    }))
    writeFile('rules', updated)
    resolve()
  })
}

// Staff
export function getAllStaff() {
  return new Promise((resolve) => {
    const data = readFile('staff')
    resolve(data.sort((a, b) => a.order_index - b.order_index))
  })
}

export function updateStaff(staff) {
  return new Promise((resolve) => {
    const updated = staff.map((s, idx) => ({
      id: s.id || idx + 1,
      name: s.name,
      role: s.role,
      color: s.color,
      order_index: idx,
      created_at: s.created_at || new Date().toISOString()
    }))
    writeFile('staff', updated)
    resolve()
  })
}

// FAQ
export function getAllFAQ() {
  return new Promise((resolve) => {
    const data = readFile('faq')
    resolve(data.sort((a, b) => a.order_index - b.order_index))
  })
}

export function updateFAQ(faq) {
  return new Promise((resolve) => {
    const updated = faq.map((f, idx) => ({
      id: f.id || idx + 1,
      question: f.question,
      answer: f.answer,
      order_index: idx,
      created_at: f.created_at || new Date().toISOString()
    }))
    writeFile('faq', updated)
    resolve()
  })
}

// Events
export function getAllEvents() {
  return new Promise((resolve) => {
    const data = readFile('events')
    resolve(data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)))
  })
}

export function getEventById(id) {
  return new Promise((resolve) => {
    const data = readFile('events')
    resolve(data.find(item => item.id === parseInt(id)))
  })
}

export function createEvent(title, description, startDate, endDate, imageUrl, location, featured) {
  return new Promise((resolve) => {
    const data = readFile('events')
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    const newItem = {
      id: newId,
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      image_url: imageUrl || '',
      location: location || '',
      featured: featured ? 1 : 0,
      created_at: new Date().toISOString()
    }
    data.push(newItem)
    writeFile('events', data)
    resolve(newId)
  })
}

export function updateEvent(id, title, description, startDate, endDate, imageUrl, location, featured) {
  return new Promise((resolve) => {
    const data = readFile('events')
    const index = data.findIndex(item => item.id === parseInt(id))
    if (index !== -1) {
      data[index] = {
        ...data[index],
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        image_url: imageUrl,
        location,
        featured: featured ? 1 : 0
      }
      writeFile('events', data)
    }
    resolve()
  })
}

export function deleteEvent(id) {
  return new Promise((resolve) => {
    const data = readFile('events')
    const filtered = data.filter(item => item.id !== parseInt(id))
    writeFile('events', filtered)
    resolve()
  })
}

// Staff Applications
export function getAllStaffApplications() {
  return new Promise((resolve, reject) => {
    try {
      const data = readFile('staff_applications')
      resolve(data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0)
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0)
        return dateB - dateA
      }))
    } catch (err) {
      console.error('Error getting staff applications:', err)
      reject(err)
    }
  })
}

export function getStaffApplicationById(id) {
  return new Promise((resolve) => {
    const data = readFile('staff_applications')
    resolve(data.find(item => item.id === parseInt(id)))
  })
}

export function createStaffApplication(name, email, discord, age, experience, why, previousStaff, minecraftUsername, rankId, answers, status) {
  return new Promise((resolve) => {
    const data = readFile('staff_applications')
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    const newItem = {
      id: newId,
      name,
      email,
      discord,
      age: parseInt(age) || 0,
      experience,
      why,
      previous_staff: previousStaff || '',
      minecraft_username: minecraftUsername || '',
      rank_id: parseInt(rankId) || null,
      answers: answers || {},
      status: status || 'pending',
      created_at: new Date().toISOString()
    }
    data.push(newItem)
    writeFile('staff_applications', data)
    resolve(newId)
  })
}

export function updateStaffApplicationStatus(id, status) {
  return new Promise((resolve) => {
    const data = readFile('staff_applications')
    const index = data.findIndex(item => item.id === parseInt(id))
    if (index !== -1) {
      data[index].status = status
      writeFile('staff_applications', data)
    }
    resolve()
  })
}

export function deleteStaffApplication(id) {
  return new Promise((resolve) => {
    const data = readFile('staff_applications')
    const filtered = data.filter(item => item.id !== parseInt(id))
    writeFile('staff_applications', filtered)
    resolve()
  })
}

// Staff Ranks
export function getAllStaffRanks() {
  return new Promise((resolve, reject) => {
    try {
      const data = readFile('staff_ranks')
      resolve(data.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)))
    } catch (err) {
      console.error('Error getting staff ranks:', err)
      reject(err)
    }
  })
}

export function getStaffRankById(id) {
  return new Promise((resolve) => {
    const data = readFile('staff_ranks')
    resolve(data.find(item => item.id === parseInt(id)))
  })
}

export function getOpenStaffRanks() {
  return new Promise((resolve, reject) => {
    try {
      const data = readFile('staff_ranks')
      resolve(data.filter(rank => rank.open === 1).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)))
    } catch (err) {
      console.error('Error getting open staff ranks:', err)
      reject(err)
    }
  })
}

export function createStaffRank(name, description, questions, open, orderIndex) {
  return new Promise((resolve) => {
    const data = readFile('staff_ranks')
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    const newItem = {
      id: newId,
      name,
      description: description || '',
      questions: questions || [],
      open: open ? 1 : 0,
      order_index: orderIndex || data.length,
      created_at: new Date().toISOString()
    }
    data.push(newItem)
    writeFile('staff_ranks', data)
    resolve(newId)
  })
}

export function updateStaffRank(id, name, description, questions, open, orderIndex) {
  return new Promise((resolve) => {
    const data = readFile('staff_ranks')
    const index = data.findIndex(item => item.id === parseInt(id))
    if (index !== -1) {
      data[index] = {
        ...data[index],
        name,
        description,
        questions: questions || [],
        open: open ? 1 : 0,
        order_index: orderIndex !== undefined ? orderIndex : data[index].order_index
      }
      writeFile('staff_ranks', data)
    }
    resolve()
  })
}

export function deleteStaffRank(id) {
  return new Promise((resolve) => {
    const data = readFile('staff_ranks')
    const filtered = data.filter(item => item.id !== parseInt(id))
    writeFile('staff_ranks', filtered)
    resolve()
  })
}
