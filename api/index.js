import express from 'express'
import cors from 'cors'
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
} from '../server/database.js'
import { initMailjet, sendStaffApplicationNotification, sendStaffApplicationResponse } from '../server/mailjet.js'

const app = express()

app.use(cors())
app.use(express.json())

// Initialize database
let dbInitialized = false
try {
  initDatabase()
  dbInitialized = true
  console.log('✅ Database initialized successfully')
} catch (err) {
  console.error('❌ Database initialization error:', err)
  console.error('Stack:', err.stack)
}

// Initialize Mailjet
if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
  initMailjet(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET)
}

// Helper to safely call database functions
const safeDbCall = async (fn, defaultValue = []) => {
  try {
    const result = await fn()
    return result || defaultValue
  } catch (err) {
    console.error('Database call error:', err)
    return defaultValue
  }
}

// Server Info
app.get('/api/server-info', async (req, res) => {
  try {
    const info = await safeDbCall(getServerInfo, { onlinePlayers: 0, version: '1.20+', description: 'Discover a new world full of adventure and possibilities on AetherGens.', serverIp: 'play.aethergens.com' })
    res.json(info)
  } catch (err) {
    console.error('Error in /api/server-info:', err)
    res.json({ onlinePlayers: 0, version: '1.20+', description: '', serverIp: 'play.aethergens.com' })
  }
})

app.post('/api/server-info', async (req, res) => {
  try {
    await updateServerInfo(req.body.onlinePlayers, req.body.version, req.body.description, req.body.serverIp)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating server info:', err)
    res.json({ success: false, error: err.message })
  }
})

// News
app.get('/api/news', async (req, res) => {
  const news = await safeDbCall(getAllNews, [])
  res.json(news)
})

app.get('/api/news/:id', async (req, res) => {
  try {
    const item = await getNewsById(req.params.id)
    res.json(item || null)
  } catch (err) {
    console.error('Error getting news item:', err)
    res.json(null)
  }
})

app.post('/api/news', async (req, res) => {
  try {
    const id = await createNews(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating news:', err)
    res.json({ success: false, error: err.message })
  }
})

app.put('/api/news/:id', async (req, res) => {
  try {
    await updateNews(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating news:', err)
    res.json({ success: false, error: err.message })
  }
})

app.delete('/api/news/:id', async (req, res) => {
  try {
    await deleteNews(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting news:', err)
    res.json({ success: false, error: err.message })
  }
})

// Changelog
app.get('/api/changelog', async (req, res) => {
  const changelog = await safeDbCall(getAllChangelog, [])
  res.json(changelog)
})

app.post('/api/changelog', async (req, res) => {
  try {
    const id = await createChangelog(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating changelog:', err)
    res.json({ success: false, error: err.message })
  }
})

app.put('/api/changelog/:id', async (req, res) => {
  try {
    await updateChangelog(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating changelog:', err)
    res.json({ success: false, error: err.message })
  }
})

app.delete('/api/changelog/:id', async (req, res) => {
  try {
    await deleteChangelog(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting changelog:', err)
    res.json({ success: false, error: err.message })
  }
})

// Gallery
app.get('/api/gallery', async (req, res) => {
  const gallery = await safeDbCall(getAllGallery, [])
  res.json(gallery)
})

app.post('/api/gallery', async (req, res) => {
  try {
    const id = await createGalleryItem(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating gallery item:', err)
    res.json({ success: false, error: err.message })
  }
})

app.put('/api/gallery/:id', async (req, res) => {
  try {
    await updateGalleryItem(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating gallery item:', err)
    res.json({ success: false, error: err.message })
  }
})

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    await deleteGalleryItem(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting gallery item:', err)
    res.json({ success: false, error: err.message })
  }
})

// Shop
app.get('/api/shop', async (req, res) => {
  const shop = await safeDbCall(getAllShopItems, [])
  res.json(shop)
})

app.post('/api/shop', async (req, res) => {
  try {
    const id = await createShopItem(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating shop item:', err)
    res.json({ success: false, error: err.message })
  }
})

app.put('/api/shop/:id', async (req, res) => {
  try {
    await updateShopItem(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating shop item:', err)
    res.json({ success: false, error: err.message })
  }
})

app.delete('/api/shop/:id', async (req, res) => {
  try {
    await deleteShopItem(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting shop item:', err)
    res.json({ success: false, error: err.message })
  }
})

// Features
app.get('/api/features', async (req, res) => {
  const features = await safeDbCall(getAllFeatures, [])
  res.json(features)
})

app.post('/api/features', async (req, res) => {
  try {
    await updateFeatures(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating features:', err)
    res.json({ success: false, error: err.message })
  }
})

// Rules
app.get('/api/rules', async (req, res) => {
  const rules = await safeDbCall(getAllRules, [])
  res.json(rules)
})

app.post('/api/rules', async (req, res) => {
  try {
    await updateRules(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating rules:', err)
    res.json({ success: false, error: err.message })
  }
})

// Staff
app.get('/api/staff', async (req, res) => {
  const staff = await safeDbCall(getAllStaff, [])
  res.json(staff)
})

app.post('/api/staff', async (req, res) => {
  try {
    await updateStaff(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating staff:', err)
    res.json({ success: false, error: err.message })
  }
})

// FAQ
app.get('/api/faq', async (req, res) => {
  const faq = await safeDbCall(getAllFAQ, [])
  res.json(faq)
})

app.post('/api/faq', async (req, res) => {
  try {
    await updateFAQ(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating FAQ:', err)
    res.json({ success: false, error: err.message })
  }
})

// Events
app.get('/api/events', async (req, res) => {
  const events = await safeDbCall(getAllEvents, [])
  res.json(events)
})

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id)
    res.json(event || null)
  } catch (err) {
    console.error('Error getting event:', err)
    res.json(null)
  }
})

app.post('/api/events', async (req, res) => {
  try {
    const id = await createEvent(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating event:', err)
    res.json({ success: false, error: err.message })
  }
})

app.put('/api/events/:id', async (req, res) => {
  try {
    await updateEvent(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating event:', err)
    res.json({ success: false, error: err.message })
  }
})

app.delete('/api/events/:id', async (req, res) => {
  try {
    await deleteEvent(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting event:', err)
    res.json({ success: false, error: err.message })
  }
})

// Staff Applications
app.get('/api/staff-applications', async (req, res) => {
  const applications = await safeDbCall(getAllStaffApplications, [])
  res.json(applications)
})

app.get('/api/staff-applications/:id', async (req, res) => {
  try {
    const application = await getStaffApplicationById(req.params.id)
    res.json(application || null)
  } catch (err) {
    console.error('Error getting application:', err)
    res.json(null)
  }
})

app.post('/api/staff-applications', async (req, res) => {
  try {
    const id = await createStaffApplication(req.body)
    
    // Send notification email
    if (process.env.MAILJET_API_KEY) {
      try {
        await sendStaffApplicationNotification(req.body)
      } catch (emailErr) {
        console.error('Email notification error:', emailErr)
      }
    }
    
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating application:', err)
    res.json({ success: false, error: err.message })
  }
})

app.put('/api/staff-applications/:id/accept', async (req, res) => {
  try {
    await updateStaffApplicationStatus(req.params.id, 'accepted')
    
    // Send acceptance email
    if (process.env.MAILJET_API_KEY) {
      try {
        const application = await getStaffApplicationById(req.params.id)
        await sendStaffApplicationResponse(application.email, 'accepted', application)
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }
    }
    
    res.json({ success: true })
  } catch (err) {
    console.error('Error accepting application:', err)
    res.json({ success: false, error: err.message })
  }
})

app.put('/api/staff-applications/:id/reject', async (req, res) => {
  try {
    await updateStaffApplicationStatus(req.params.id, 'rejected')
    
    // Send rejection email
    if (process.env.MAILJET_API_KEY) {
      try {
        const application = await getStaffApplicationById(req.params.id)
        await sendStaffApplicationResponse(application.email, 'rejected', application)
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }
    }
    
    res.json({ success: true })
  } catch (err) {
    console.error('Error rejecting application:', err)
    res.json({ success: false, error: err.message })
  }
})

app.delete('/api/staff-applications/:id', async (req, res) => {
  try {
    await deleteStaffApplication(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting application:', err)
    res.json({ success: false, error: err.message })
  }
})

// Staff Ranks
app.get('/api/staff-ranks', async (req, res) => {
  const ranks = await safeDbCall(getAllStaffRanks, [])
  res.json(ranks)
})

app.get('/api/staff-ranks/open', async (req, res) => {
  const ranks = await safeDbCall(getOpenStaffRanks, [])
  res.json(ranks)
})

app.get('/api/staff-ranks/:id', async (req, res) => {
  try {
    const rank = await getStaffRankById(req.params.id)
    res.json(rank || null)
  } catch (err) {
    console.error('Error getting rank:', err)
    res.json(null)
  }
})

app.post('/api/staff-ranks', async (req, res) => {
  try {
    const id = await createStaffRank(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating rank:', err)
    res.json({ success: false, error: err.message })
  }
})

app.put('/api/staff-ranks/:id', async (req, res) => {
  try {
    await updateStaffRank(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating rank:', err)
    res.json({ success: false, error: err.message })
  }
})

app.delete('/api/staff-ranks/:id', async (req, res) => {
  try {
    await deleteStaffRank(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting rank:', err)
    res.json({ success: false, error: err.message })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err)
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error',
    path: req.path 
  })
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `API endpoint not found: ${req.path}` 
  })
})

// Vercel serverless function handler
export default app
