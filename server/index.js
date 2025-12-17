import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  initDatabase, getServerInfo, updateServerInfo,
  getAllNews, getNewsById, createNews, updateNews, deleteNews,
  getAllChangelog, createChangelog, updateChangelog, deleteChangelog,
  getAllGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
  getAllShopItems, createShopItem, updateShopItem, deleteShopItem,
  getAllFeatures, updateFeatures,
  getAllRules, updateRules,
  getAllStaff, updateStaff,
  getAllFAQ, updateFAQ,
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
  getAllStaffApplications, getStaffApplicationById, createStaffApplication, updateStaffApplicationStatus, deleteStaffApplication,
  getAllStaffRanks, getStaffRankById, getOpenStaffRanks, createStaffRank, updateStaffRank, deleteStaffRank
} from './database.js'
import { initMailjet, sendStaffApplicationNotification, sendStaffApplicationResponse } from './mailjet.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize database
try {
  initDatabase()
  console.log('Database initialized successfully')
} catch (err) {
  console.error('Database initialization error:', err)
}

// Initialize Mailjet
if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
  initMailjet(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET)
  console.log('Mailjet initialized successfully')
} else {
  console.warn('Mailjet not configured. Set MAILJET_API_KEY and MAILJET_API_SECRET environment variables to enable email functionality.')
}

// Server Info
app.get('/api/server-info', async (req, res) => {
  try {
    const info = await getServerInfo()
    res.json(info)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/server-info', async (req, res) => {
  try {
    const { onlinePlayers, version, description, serverIp } = req.body
    updateServerInfo(onlinePlayers, version, description, serverIp)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// News
app.get('/api/news', async (req, res) => {
  try {
    const news = await getAllNews()
    res.json(news)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/api/news/:id', async (req, res) => {
  try {
    const news = await getNewsById(req.params.id)
    res.json(news)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/news', async (req, res) => {
  try {
    const { title, content, author, imageUrl, published } = req.body
    const id = await createNews(title, content, author, imageUrl, published)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/news/:id', async (req, res) => {
  try {
    const { title, content, author, imageUrl, published } = req.body
    await updateNews(req.params.id, title, content, author, imageUrl, published)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/news/:id', async (req, res) => {
  try {
    await deleteNews(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Changelog
app.get('/api/changelog', async (req, res) => {
  try {
    const changelog = await getAllChangelog()
    res.json(changelog)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/changelog', async (req, res) => {
  try {
    const { version, title, description, type } = req.body
    const id = await createChangelog(version, title, description, type)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/changelog/:id', async (req, res) => {
  try {
    const { version, title, description, type } = req.body
    await updateChangelog(req.params.id, version, title, description, type)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/changelog/:id', async (req, res) => {
  try {
    await deleteChangelog(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Gallery
app.get('/api/gallery', async (req, res) => {
  try {
    const gallery = await getAllGallery()
    res.json(gallery)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/gallery', async (req, res) => {
  try {
    const { title, imageUrl, description, category, featured } = req.body
    const id = await createGalleryItem(title, imageUrl, description, category, featured)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/gallery/:id', async (req, res) => {
  try {
    const { title, imageUrl, description, category, featured } = req.body
    await updateGalleryItem(req.params.id, title, imageUrl, description, category, featured)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    await deleteGalleryItem(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Shop
app.get('/api/shop', async (req, res) => {
  try {
    const items = await getAllShopItems()
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/shop', async (req, res) => {
  try {
    const { name, description, price, category, tebexId, imageUrl, featured, active } = req.body
    const id = await createShopItem(name, description, price, category, tebexId, imageUrl, featured, active)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/shop/:id', async (req, res) => {
  try {
    const { name, description, price, category, tebexId, imageUrl, featured, active } = req.body
    await updateShopItem(req.params.id, name, description, price, category, tebexId, imageUrl, featured, active)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/shop/:id', async (req, res) => {
  try {
    await deleteShopItem(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Features
app.get('/api/features', async (req, res) => {
  try {
    const features = await getAllFeatures()
    res.json(features)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/features', async (req, res) => {
  try {
    await updateFeatures(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Rules
app.get('/api/rules', async (req, res) => {
  try {
    const rules = await getAllRules()
    res.json(rules)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/rules', async (req, res) => {
  try {
    await updateRules(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Staff
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await getAllStaff()
    res.json(staff)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/staff', async (req, res) => {
  try {
    await updateStaff(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// FAQ
app.get('/api/faq', async (req, res) => {
  try {
    const faq = await getAllFAQ()
    res.json(faq)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/faq', async (req, res) => {
  try {
    await updateFAQ(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await getAllEvents()
    res.json(events)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id)
    res.json(event)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/events', async (req, res) => {
  try {
    const { title, description, startDate, endDate, imageUrl, location, featured } = req.body
    const id = await createEvent(title, description, startDate, endDate, imageUrl, location, featured)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/events/:id', async (req, res) => {
  try {
    const { title, description, startDate, endDate, imageUrl, location, featured } = req.body
    await updateEvent(req.params.id, title, description, startDate, endDate, imageUrl, location, featured)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/events/:id', async (req, res) => {
  try {
    await deleteEvent(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Staff Applications
app.get('/api/staff-applications', async (req, res) => {
  try {
    const applications = await getAllStaffApplications()
    res.json(applications || [])
  } catch (err) {
    console.error('Error fetching staff applications:', err)
    res.status(500).json({ error: 'Database error', details: err.message })
  }
})

app.get('/api/staff-applications/:id', async (req, res) => {
  try {
    const application = await getStaffApplicationById(req.params.id)
    res.json(application)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/staff-applications', async (req, res) => {
  try {
    const { name, email, discord, age, experience, why, previousStaff, minecraftUsername, rankId, answers } = req.body
    const id = await createStaffApplication(name, email, discord, age, experience, why, previousStaff, minecraftUsername, rankId, answers, 'pending')
    
    // Send notification email to admin
    const application = await getStaffApplicationById(id)
    const rank = rankId ? await getStaffRankById(rankId) : null
    await sendStaffApplicationNotification(application, rank?.name)
    
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/staff-applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    await updateStaffApplicationStatus(req.params.id, status)
    
    // Send response email to applicant
    const application = await getStaffApplicationById(req.params.id)
    if (application) {
      await sendStaffApplicationResponse(application, status)
    }
    
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/staff-applications/:id', async (req, res) => {
  try {
    await deleteStaffApplication(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Staff Ranks
app.get('/api/staff-ranks', async (req, res) => {
  try {
    const ranks = await getAllStaffRanks()
    res.json(ranks || [])
  } catch (err) {
    console.error('Error fetching staff ranks:', err)
    res.status(500).json({ error: 'Database error', details: err.message })
  }
})

app.get('/api/staff-ranks/open', async (req, res) => {
  try {
    const ranks = await getOpenStaffRanks()
    res.json(ranks)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/api/staff-ranks/:id', async (req, res) => {
  try {
    const rank = await getStaffRankById(req.params.id)
    res.json(rank)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/staff-ranks', async (req, res) => {
  try {
    const { name, description, questions, open, orderIndex } = req.body
    const id = await createStaffRank(name, description, questions, open, orderIndex)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/staff-ranks/:id', async (req, res) => {
  try {
    const { name, description, questions, open, orderIndex } = req.body
    await updateStaffRank(req.params.id, name, description, questions, open, orderIndex)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/staff-ranks/:id', async (req, res) => {
  try {
    await deleteStaffRank(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 API endpoints available at /api/*`)
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Serving production build`)
  }
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other process or change the port.`)
  } else {
    console.error('Server error:', err)
  }
})
