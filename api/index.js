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
const safeDbCall = async (res, dbFunction, ...args) => {
  try {
    const result = await dbFunction(...args)
    res.json(result)
  } catch (err) {
    console.error('Database operation failed:', err)
    console.error('Stack:', err.stack)
    // For GET requests, return empty array/object to prevent frontend crashes
    if (dbFunction.name.startsWith('get') || dbFunction.name.startsWith('getAll')) {
      res.status(200).json([]) // Return empty array for list fetches
    } else if (dbFunction.name.includes('Info')) {
      res.status(200).json({}) // Return empty object for single item fetches
    } else {
      res.status(500).json({ success: false, error: err.message || 'Database error' })
    }
  }
}

// Server Info
app.get('/api/server-info', async (req, res) => {
  await safeDbCall(res, getServerInfo)
})

app.post('/api/server-info', async (req, res) => {
  try {
    await updateServerInfo(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating server info:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// News
app.get('/api/news', async (req, res) => {
  await safeDbCall(res, getAllNews)
})

app.get('/api/news/:id', async (req, res) => {
  await safeDbCall(res, getNewsById, req.params.id)
})

app.post('/api/news', async (req, res) => {
  try {
    const id = await createNews(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating news:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/api/news/:id', async (req, res) => {
  try {
    await updateNews(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating news:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/api/news/:id', async (req, res) => {
  try {
    await deleteNews(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting news:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Changelog
app.get('/api/changelog', async (req, res) => {
  await safeDbCall(res, getAllChangelog)
})

app.post('/api/changelog', async (req, res) => {
  try {
    const id = await createChangelog(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating changelog:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/api/changelog/:id', async (req, res) => {
  try {
    await updateChangelog(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating changelog:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/api/changelog/:id', async (req, res) => {
  try {
    await deleteChangelog(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting changelog:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Gallery
app.get('/api/gallery', async (req, res) => {
  await safeDbCall(res, getAllGallery)
})

app.post('/api/gallery', async (req, res) => {
  try {
    const id = await createGalleryItem(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating gallery item:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/api/gallery/:id', async (req, res) => {
  try {
    await updateGalleryItem(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating gallery item:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    await deleteGalleryItem(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting gallery item:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Shop
app.get('/api/shop', async (req, res) => {
  await safeDbCall(res, getAllShopItems)
})

app.post('/api/shop', async (req, res) => {
  try {
    const id = await createShopItem(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating shop item:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/api/shop/:id', async (req, res) => {
  try {
    await updateShopItem(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating shop item:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/api/shop/:id', async (req, res) => {
  try {
    await deleteShopItem(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting shop item:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Features
app.get('/api/features', async (req, res) => {
  await safeDbCall(res, getAllFeatures)
})

app.put('/api/features', async (req, res) => {
  try {
    await updateFeatures(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating features:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Rules
app.get('/api/rules', async (req, res) => {
  await safeDbCall(res, getAllRules)
})

app.put('/api/rules', async (req, res) => {
  try {
    await updateRules(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating rules:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Staff
app.get('/api/staff', async (req, res) => {
  await safeDbCall(res, getAllStaff)
})

app.put('/api/staff', async (req, res) => {
  try {
    await updateStaff(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating staff:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// FAQ
app.get('/api/faq', async (req, res) => {
  await safeDbCall(res, getAllFAQ)
})

app.put('/api/faq', async (req, res) => {
  try {
    await updateFAQ(req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating FAQ:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Events
app.get('/api/events', async (req, res) => {
  await safeDbCall(res, getAllEvents)
})

app.get('/api/events/:id', async (req, res) => {
  await safeDbCall(res, getEventById, req.params.id)
})

app.post('/api/events', async (req, res) => {
  try {
    const id = await createEvent(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating event:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/api/events/:id', async (req, res) => {
  try {
    await updateEvent(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating event:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/api/events/:id', async (req, res) => {
  try {
    await deleteEvent(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting event:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Staff Applications
app.get('/api/staff-applications', async (req, res) => {
  await safeDbCall(res, getAllStaffApplications)
})

app.get('/api/staff-applications/:id', async (req, res) => {
  await safeDbCall(res, getStaffApplicationById, req.params.id)
})

app.post('/api/staff-applications', async (req, res) => {
  try {
    const { name, email, discordUsername, minecraftUsername, rankId, answers } = req.body
    const id = await createStaffApplication({ name, email, discordUsername, minecraftUsername, rankId, answers })
    
    // Send notification email to admin
    try {
      const application = await getStaffApplicationById(id)
      const rank = rankId ? await getStaffRankById(rankId) : null
      await sendStaffApplicationNotification(application, rank?.name)
    } catch (emailErr) {
      console.error('Email notification error:', emailErr)
    }
    
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating staff application:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/api/staff-applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    await updateStaffApplicationStatus(req.params.id, status)
    
    // Send response email to applicant
    try {
      const application = await getStaffApplicationById(req.params.id)
      await sendStaffApplicationResponse(application.email, status, application)
    } catch (emailErr) {
      console.error('Email error:', emailErr)
    }
    
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating application status:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/api/staff-applications/:id', async (req, res) => {
  try {
    await deleteStaffApplication(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting application:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Staff Ranks
app.get('/api/staff-ranks', async (req, res) => {
  await safeDbCall(res, getAllStaffRanks)
})

app.get('/api/staff-ranks/open', async (req, res) => {
  await safeDbCall(res, getOpenStaffRanks)
})

app.get('/api/staff-ranks/:id', async (req, res) => {
  await safeDbCall(res, getStaffRankById, req.params.id)
})

app.post('/api/staff-ranks', async (req, res) => {
  try {
    const id = await createStaffRank(req.body)
    res.json({ success: true, id })
  } catch (err) {
    console.error('Error creating staff rank:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.put('/api/staff-ranks/:id', async (req, res) => {
  try {
    await updateStaffRank(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating staff rank:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/api/staff-ranks/:id', async (req, res) => {
  try {
    await deleteStaffRank(req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting staff rank:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Error handling
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

