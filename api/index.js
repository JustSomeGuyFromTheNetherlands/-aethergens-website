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
try {
  initDatabase()
} catch (err) {
  console.error('Database initialization error:', err)
}

// Initialize Mailjet
if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
  initMailjet(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET)
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
    await updateServerInfo(req.body.onlinePlayers, req.body.version, req.body.description, req.body.serverIp)
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
    const item = await getNewsById(req.params.id)
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/news', async (req, res) => {
  try {
    const id = await createNews(req.body)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/news/:id', async (req, res) => {
  try {
    await updateNews(req.params.id, req.body)
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
    const id = await createChangelog(req.body)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/changelog/:id', async (req, res) => {
  try {
    await updateChangelog(req.params.id, req.body)
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
    const id = await createGalleryItem(req.body)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/gallery/:id', async (req, res) => {
  try {
    await updateGalleryItem(req.params.id, req.body)
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
    const shop = await getAllShopItems()
    res.json(shop)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/shop', async (req, res) => {
  try {
    const id = await createShopItem(req.body)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/shop/:id', async (req, res) => {
  try {
    await updateShopItem(req.params.id, req.body)
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
    const id = await createEvent(req.body)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/events/:id', async (req, res) => {
  try {
    await updateEvent(req.params.id, req.body)
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
    res.json(applications)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
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
    res.status(500).json({ error: 'Database error' })
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
    res.status(500).json({ error: 'Database error' })
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
    res.json(ranks)
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
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
    const id = await createStaffRank(req.body)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/staff-ranks/:id', async (req, res) => {
  try {
    await updateStaffRank(req.params.id, req.body)
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

// Vercel serverless function handler
export default app

