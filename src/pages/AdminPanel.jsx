import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('server')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  // Server Info
  const [serverInfo, setServerInfo] = useState({ onlinePlayers: 0, version: '1.20+', description: '', serverIp: 'play.aethergens.com' })
  
  // News
  const [news, setNews] = useState([])
  const [newsForm, setNewsForm] = useState({ title: '', content: '', author: 'Admin', imageUrl: '', published: true })
  const [editingNews, setEditingNews] = useState(null)

  // Changelog
  const [changelog, setChangelog] = useState([])
  const [changelogForm, setChangelogForm] = useState({ version: '', title: '', description: '', type: 'update' })
  const [editingChangelog, setEditingChangelog] = useState(null)

  // Gallery
  const [gallery, setGallery] = useState([])
  const [galleryForm, setGalleryForm] = useState({ title: '', imageUrl: '', description: '', category: 'general', featured: false })
  const [editingGallery, setEditingGallery] = useState(null)

  // Shop
  const [shopItems, setShopItems] = useState([])
  const [shopForm, setShopForm] = useState({ name: '', description: '', price: '', category: 'ranks', tebexId: '', imageUrl: '', featured: false, active: true })
  const [editingShop, setEditingShop] = useState(null)

  // Features
  const [features, setFeatures] = useState([])
  const [featureForm, setFeatureForm] = useState({ icon: '', title: '', description: '' })

  // Rules
  const [rules, setRules] = useState([])
  const [ruleForm, setRuleForm] = useState({ ruleText: '' })

  // Staff
  const [staff, setStaff] = useState([])
  const [staffForm, setStaffForm] = useState({ name: '', role: '', color: '#1565C0' })

  // FAQ
  const [faq, setFaq] = useState([])
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' })

  // Events
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState({ title: '', description: '', startDate: '', endDate: '', imageUrl: '', location: '', featured: false })
  const [editingEvent, setEditingEvent] = useState(null)

  // Staff Applications
  const [staffApplications, setStaffApplications] = useState([])

  // Staff Ranks
  const [staffRanks, setStaffRanks] = useState([])
  const [rankForm, setRankForm] = useState({ name: '', description: '', questions: [], open: true })
  const [editingRank, setEditingRank] = useState(null)
  const [newQuestion, setNewQuestion] = useState({ question: '', required: true })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      const fetchWithErrorHandling = async (url, defaultValue = []) => {
        try {
          const res = await fetch(url)
          if (!res.ok) {
            console.error(`Error fetching ${url}:`, res.status, res.statusText)
            return defaultValue
          }
          return await res.json()
        } catch (err) {
          console.error(`Error fetching ${url}:`, err)
          return defaultValue
        }
      }

      const [server, newsData, changelogData, galleryData, shopData, featuresData, rulesData, staffData, faqData, eventsData, applicationsData, ranksData] = await Promise.all([
        fetchWithErrorHandling('/api/server-info', {}),
        fetchWithErrorHandling('/api/news', []),
        fetchWithErrorHandling('/api/changelog', []),
        fetchWithErrorHandling('/api/gallery', []),
        fetchWithErrorHandling('/api/shop', []),
        fetchWithErrorHandling('/api/features', []),
        fetchWithErrorHandling('/api/rules', []),
        fetchWithErrorHandling('/api/staff', []),
        fetchWithErrorHandling('/api/faq', []),
        fetchWithErrorHandling('/api/events', []),
        fetchWithErrorHandling('/api/staff-applications', []),
        fetchWithErrorHandling('/api/staff-ranks', []),
      ])
      setServerInfo(server)
      setNews(newsData || [])
      setChangelog(changelogData || [])
      setGallery(galleryData || [])
      setShopItems(shopData || [])
      setFeatures(featuresData || [])
      setRules(rulesData || [])
      setStaff(staffData || [])
      setFaq(faqData || [])
      setEvents(eventsData || [])
      setStaffApplications(applicationsData || [])
      setStaffRanks(ranksData || [])
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Server Info
  const saveServerInfo = async () => {
    try {
      const res = await fetch('/api/server-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverInfo)
      })
      if (res.ok) {
        showSaved()
      } else {
        alert('Error saving server info')
      }
    } catch (err) {
      console.error('Error saving server info:', err)
      alert('Error saving server info')
    }
  }

  // News
  const saveNews = async () => {
    try {
      if (!newsForm.title || !newsForm.content) {
        alert('Please fill in title and content')
        return
      }
      const url = editingNews ? `/api/news/${editingNews.id}` : '/api/news'
      const method = editingNews ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newsForm, published: newsForm.published ? 1 : 0 })
      })
      if (res.ok) {
        await loadAllData()
        setNewsForm({ title: '', content: '', author: 'Admin', imageUrl: '', published: true })
        setEditingNews(null)
        showSaved()
      } else {
        alert('Error saving news')
      }
    } catch (err) {
      console.error('Error saving news:', err)
      alert('Error saving news')
    }
  }

  const deleteNews = async (id) => {
    if (!confirm('Are you sure you want to delete this news item?')) return
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadAllData()
        showSaved()
      } else {
        alert('Error deleting news')
      }
    } catch (err) {
      console.error('Error deleting news:', err)
      alert('Error deleting news')
    }
  }

  // Changelog
  const saveChangelog = async () => {
    try {
      if (!changelogForm.version || !changelogForm.title || !changelogForm.description) {
        alert('Please fill in all required fields')
        return
      }
      const url = editingChangelog ? `/api/changelog/${editingChangelog.id}` : '/api/changelog'
      const method = editingChangelog ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changelogForm)
      })
      if (res.ok) {
        await loadAllData()
        setChangelogForm({ version: '', title: '', description: '', type: 'update' })
        setEditingChangelog(null)
        showSaved()
      } else {
        alert('Error saving changelog')
      }
    } catch (err) {
      console.error('Error saving changelog:', err)
      alert('Error saving changelog')
    }
  }

  const deleteChangelog = async (id) => {
    if (!confirm('Are you sure you want to delete this changelog entry?')) return
    try {
      const res = await fetch(`/api/changelog/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadAllData()
        showSaved()
      } else {
        alert('Error deleting changelog')
      }
    } catch (err) {
      console.error('Error deleting changelog:', err)
      alert('Error deleting changelog')
    }
  }

  // Gallery
  const saveGallery = async () => {
    try {
      if (!galleryForm.title || !galleryForm.imageUrl) {
        alert('Please fill in title and image URL')
        return
      }
      const url = editingGallery ? `/api/gallery/${editingGallery.id}` : '/api/gallery'
      const method = editingGallery ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...galleryForm, featured: galleryForm.featured ? 1 : 0 })
      })
      if (res.ok) {
        await loadAllData()
        setGalleryForm({ title: '', imageUrl: '', description: '', category: 'general', featured: false })
        setEditingGallery(null)
        showSaved()
      } else {
        alert('Error saving gallery item')
      }
    } catch (err) {
      console.error('Error saving gallery:', err)
      alert('Error saving gallery item')
    }
  }

  const deleteGallery = async (id) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadAllData()
        showSaved()
      } else {
        alert('Error deleting gallery item')
      }
    } catch (err) {
      console.error('Error deleting gallery:', err)
      alert('Error deleting gallery item')
    }
  }

  // Shop
  const saveShop = async () => {
    try {
      if (!shopForm.name || !shopForm.description || !shopForm.price) {
        alert('Please fill in name, description, and price')
        return
      }
      const url = editingShop ? `/api/shop/${editingShop.id}` : '/api/shop'
      const method = editingShop ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...shopForm, price: parseFloat(shopForm.price), featured: shopForm.featured ? 1 : 0, active: shopForm.active ? 1 : 0 })
      })
      if (res.ok) {
        await loadAllData()
        setShopForm({ name: '', description: '', price: '', category: 'ranks', tebexId: '', imageUrl: '', featured: false, active: true })
        setEditingShop(null)
        showSaved()
      } else {
        alert('Error saving shop item')
      }
    } catch (err) {
      console.error('Error saving shop:', err)
      alert('Error saving shop item')
    }
  }

  const deleteShop = async (id) => {
    if (!confirm('Are you sure you want to delete this shop item?')) return
    try {
      const res = await fetch(`/api/shop/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadAllData()
        showSaved()
      } else {
        alert('Error deleting shop item')
      }
    } catch (err) {
      console.error('Error deleting shop:', err)
      alert('Error deleting shop item')
    }
  }

  // Features
  const addFeature = () => {
    if (featureForm.icon && featureForm.title && featureForm.description) {
      setFeatures([...features, { ...featureForm, id: Date.now() }])
      setFeatureForm({ icon: '', title: '', description: '' })
    }
  }

  const removeFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx))
  }

  const saveFeatures = async () => {
    try {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      })
      if (res.ok) {
        await loadAllData()
        showSaved()
      } else {
        alert('Error saving features')
      }
    } catch (err) {
      console.error('Error saving features:', err)
      alert('Error saving features')
    }
  }

  // Rules
  const addRule = () => {
    if (ruleForm.ruleText) {
      setRules([...rules, { ruleText: ruleForm.ruleText, id: Date.now() }])
      setRuleForm({ ruleText: '' })
    }
  }

  const removeRule = (idx) => {
    setRules(rules.filter((_, i) => i !== idx))
  }

  const saveRules = async () => {
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules)
      })
      if (res.ok) {
        await loadAllData()
        showSaved()
      } else {
        alert('Error saving rules')
      }
    } catch (err) {
      console.error('Error saving rules:', err)
      alert('Error saving rules')
    }
  }

  // Staff
  const addStaff = () => {
    if (staffForm.name && staffForm.role) {
      setStaff([...staff, { ...staffForm, id: Date.now() }])
      setStaffForm({ name: '', role: '', color: '#1565C0' })
    }
  }

  const removeStaff = (idx) => {
    setStaff(staff.filter((_, i) => i !== idx))
  }

  const saveStaff = async () => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
      })
      if (res.ok) {
        await loadAllData()
        showSaved()
      } else {
        alert('Error saving staff')
      }
    } catch (err) {
      console.error('Error saving staff:', err)
      alert('Error saving staff')
    }
  }

  // FAQ
  const addFAQ = () => {
    if (faqForm.question && faqForm.answer) {
      setFaq([...faq, { ...faqForm, id: Date.now() }])
      setFaqForm({ question: '', answer: '' })
    }
  }

  const removeFAQ = (idx) => {
    setFaq(faq.filter((_, i) => i !== idx))
  }

  const saveFAQ = async () => {
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      })
      if (res.ok) {
        await loadAllData()
        showSaved()
      } else {
        alert('Error saving FAQ')
      }
    } catch (err) {
      console.error('Error saving FAQ:', err)
      alert('Error saving FAQ')
    }
  }

  const tabs = ['server', 'news', 'changelog', 'gallery', 'shop', 'events', 'features', 'rules', 'staff', 'faq', 'ranks', 'applications']

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold" style={{ color: '#1565C0' }}>Admin Panel</div>
            <button onClick={() => navigate('/')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === tab ? { borderBottomColor: '#1565C0' } : {}}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          {/* Server Info Tab */}
          {activeTab === 'server' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Server Settings</h2>
                <p className="text-gray-600 text-sm mb-6">Manage your server's basic information displayed on the homepage. Update player count, version, IP address, and description.</p>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Online Players</label>
                <input type="number" value={serverInfo.onlinePlayers} onChange={(e) => setServerInfo({ ...serverInfo, onlinePlayers: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Server Version</label>
                <input type="text" value={serverInfo.version} onChange={(e) => setServerInfo({ ...serverInfo, version: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Server IP</label>
                <input type="text" value={serverInfo.serverIp} onChange={(e) => setServerInfo({ ...serverInfo, serverIp: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Description</label>
                <textarea value={serverInfo.description} onChange={(e) => setServerInfo({ ...serverInfo, description: e.target.value })} rows="6" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <button onClick={saveServerInfo} className="w-full py-3 rounded-md font-medium text-white transition-colors" style={{ backgroundColor: saved ? '#16A34A' : '#1565C0' }}>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage News</h2>
                <p className="text-gray-600 text-sm mb-6">Create and manage news posts that appear on the homepage. Add titles, content, images, and set publish status. Only published news will be visible to visitors.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Author" value={newsForm.author} onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Image URL" value={newsForm.imageUrl} onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <textarea placeholder="Content" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} rows="4" className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newsForm.published} onChange={(e) => setNewsForm({ ...newsForm, published: e.target.checked })} />
                  Published
                </label>
              </div>
              <button onClick={saveNews} className="px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: '#1565C0' }}>
                {editingNews ? 'Update' : 'Add'} News
              </button>
              {editingNews && <button onClick={() => { setEditingNews(null); setNewsForm({ title: '', content: '', author: 'Admin', imageUrl: '', published: true }) }} className="ml-2 px-6 py-2 rounded-md border border-gray-300">Cancel</button>}
              
              <div className="mt-8 space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{item.title}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingNews(item); setNewsForm({ title: item.title, content: item.content, author: item.author, imageUrl: item.image_url || '', published: item.published === 1 }) }} className="text-blue-600 text-sm">Edit</button>
                        <button onClick={() => deleteNews(item.id)} className="text-red-600 text-sm">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{item.content.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog Tab */}
          {activeTab === 'changelog' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Changelog</h2>
                <p className="text-gray-600 text-sm mb-6">Track server updates, fixes, and new features. Use types: "update" for general updates, "fix" for bug fixes, and "feature" for new additions.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Version" value={changelogForm.version} onChange={(e) => setChangelogForm({ ...changelogForm, version: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <select value={changelogForm.type} onChange={(e) => setChangelogForm({ ...changelogForm, type: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md">
                  <option value="update">Update</option>
                  <option value="fix">Fix</option>
                  <option value="feature">Feature</option>
                </select>
                <input type="text" placeholder="Title" value={changelogForm.title} onChange={(e) => setChangelogForm({ ...changelogForm, title: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <textarea placeholder="Description" value={changelogForm.description} onChange={(e) => setChangelogForm({ ...changelogForm, description: e.target.value })} rows="4" className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
              </div>
              <button onClick={saveChangelog} className="px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: '#1565C0' }}>
                {editingChangelog ? 'Update' : 'Add'} Entry
              </button>
              {editingChangelog && <button onClick={() => { setEditingChangelog(null); setChangelogForm({ version: '', title: '', description: '', type: 'update' }) }} className="ml-2 px-6 py-2 rounded-md border border-gray-300">Cancel</button>}
              
              <div className="mt-8 space-y-4">
                {changelog.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-semibold">{item.version}</span>
                        <span className="ml-2 text-sm text-gray-600">{item.type}</span>
                        <h3 className="font-bold">{item.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingChangelog(item); setChangelogForm({ version: item.version, title: item.title, description: item.description, type: item.type }) }} className="text-blue-600 text-sm">Edit</button>
                        <button onClick={() => deleteChangelog(item.id)} className="text-red-600 text-sm">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Gallery</h2>
                <p className="text-gray-600 text-sm mb-6">Upload screenshots and images to showcase your server. Featured items appear first. Use categories to organize images (e.g., builds, events, spawn).</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Title" value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Category" value={galleryForm.category} onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Image URL" value={galleryForm.imageUrl} onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <textarea placeholder="Description" value={galleryForm.description} onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })} rows="3" className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={galleryForm.featured} onChange={(e) => setGalleryForm({ ...galleryForm, featured: e.target.checked })} />
                  Featured
                </label>
              </div>
              <button onClick={saveGallery} className="px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: '#1565C0' }}>
                {editingGallery ? 'Update' : 'Add'} Item
              </button>
              {editingGallery && <button onClick={() => { setEditingGallery(null); setGalleryForm({ title: '', imageUrl: '', description: '', category: 'general', featured: false }) }} className="ml-2 px-6 py-2 rounded-md border border-gray-300">Cancel</button>}
              
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                {gallery.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <h3 className="font-bold text-sm">{item.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { setEditingGallery(item); setGalleryForm({ title: item.title, imageUrl: item.image_url, description: item.description || '', category: item.category, featured: item.featured === 1 }) }} className="text-blue-600 text-xs">Edit</button>
                        <button onClick={() => deleteGallery(item.id)} className="text-red-600 text-xs">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Shop</h2>
                <p className="text-gray-600 text-sm mb-6">Add shop items that link to your Tebex store. Enter the Tebex Package ID from your Tebex dashboard. When users click "Buy Now", they'll be redirected to that package. Set items as featured to highlight them, and use active/inactive to show or hide items.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Item Name" value={shopForm.name} onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Category" value={shopForm.category} onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="number" placeholder="Price" value={shopForm.price} onChange={(e) => setShopForm({ ...shopForm, price: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Tebex Package ID" value={shopForm.tebexId} onChange={(e) => setShopForm({ ...shopForm, tebexId: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Image URL" value={shopForm.imageUrl} onChange={(e) => setShopForm({ ...shopForm, imageUrl: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <textarea placeholder="Description" value={shopForm.description} onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })} rows="3" className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={shopForm.featured} onChange={(e) => setShopForm({ ...shopForm, featured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={shopForm.active} onChange={(e) => setShopForm({ ...shopForm, active: e.target.checked })} />
                  Active
                </label>
              </div>
              <button onClick={saveShop} className="px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: '#1565C0' }}>
                {editingShop ? 'Update' : 'Add'} Item
              </button>
              {editingShop && <button onClick={() => { setEditingShop(null); setShopForm({ name: '', description: '', price: '', category: 'ranks', tebexId: '', imageUrl: '', featured: false, active: true }) }} className="ml-2 px-6 py-2 rounded-md border border-gray-300">Cancel</button>}
              
              <div className="mt-8 space-y-4">
                {shopItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-600">${item.price} - {item.category}</p>
                        {item.tebex_id && <p className="text-xs text-gray-500">Tebex ID: {item.tebex_id}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingShop(item); setShopForm({ name: item.name, description: item.description, price: item.price.toString(), category: item.category, tebexId: item.tebex_id || '', imageUrl: item.image_url || '', featured: item.featured === 1, active: item.active === 1 }) }} className="text-blue-600 text-sm">Edit</button>
                        <button onClick={() => deleteShop(item.id)} className="text-red-600 text-sm">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Features</h2>
                <p className="text-gray-600 text-sm mb-6">Showcase your server's features with icons (emojis), titles, and descriptions. These appear in the Features section on the homepage. Add features using the form, then click "Save Features" to update the website.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <input type="text" placeholder="Icon (emoji)" value={featureForm.icon} onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Title" value={featureForm.title} onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Description" value={featureForm.description} onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
              </div>
              <button onClick={addFeature} className="px-6 py-2 rounded-md border border-gray-300 mb-4">Add Feature</button>
              <div className="space-y-2 mb-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border border-gray-200 rounded-md">
                    <span className="text-2xl">{feature.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold">{feature.title}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                    <button onClick={() => removeFeature(idx)} className="text-red-600 text-sm">Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={saveFeatures} className="w-full py-3 rounded-md text-white font-medium" style={{ backgroundColor: saved ? '#16A34A' : '#1565C0' }}>
                {saved ? '✓ Saved!' : 'Save Features'}
              </button>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Rules</h2>
                <p className="text-gray-600 text-sm mb-6">Set server rules that players must follow. Add rules one at a time, then click "Save Rules" to update the website. Rules appear in a grid layout on the homepage.</p>
              </div>
              <div className="flex gap-4 mb-6">
                <input type="text" placeholder="Rule text" value={ruleForm.ruleText} onChange={(e) => setRuleForm({ ruleText: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 rounded-md" />
                <button onClick={addRule} className="px-6 py-2 rounded-md border border-gray-300">Add Rule</button>
              </div>
              <div className="space-y-2 mb-6">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <span>{rule.rule_text}</span>
                    <button onClick={() => removeRule(idx)} className="text-red-600 text-sm">Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={saveRules} className="w-full py-3 rounded-md text-white font-medium" style={{ backgroundColor: saved ? '#16A34A' : '#1565C0' }}>
                {saved ? '✓ Saved!' : 'Save Rules'}
              </button>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Staff</h2>
                <p className="text-gray-600 text-sm mb-6">Display your team members with their names, roles, and custom colors. The color picker sets the background color for the staff member's avatar circle. Add staff members, then click "Save Staff" to update the website.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <input type="text" placeholder="Name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Role" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="color" value={staffForm.color} onChange={(e) => setStaffForm({ ...staffForm, color: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md h-10" />
              </div>
              <button onClick={addStaff} className="px-6 py-2 rounded-md border border-gray-300 mb-4">Add Staff</button>
              <div className="space-y-2 mb-6">
                {staff.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 border border-gray-200 rounded-md">
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: member.color }}></div>
                    <div className="flex-1">
                      <div className="font-bold">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.role}</div>
                    </div>
                    <button onClick={() => removeStaff(idx)} className="text-red-600 text-sm">Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={saveStaff} className="w-full py-3 rounded-md text-white font-medium" style={{ backgroundColor: saved ? '#16A34A' : '#1565C0' }}>
                {saved ? '✓ Saved!' : 'Save Staff'}
              </button>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage FAQ</h2>
                <p className="text-gray-600 text-sm mb-6">Create frequently asked questions and answers for your visitors. Add questions and answers, then click "Save FAQ" to update the website. FAQs appear in an expandable format on the homepage.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
              </div>
              <button onClick={addFAQ} className="px-6 py-2 rounded-md border border-gray-300 mb-4">Add FAQ</button>
              <div className="space-y-2 mb-6">
                {faq.map((item, idx) => (
                  <div key={idx} className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold">{item.question}</div>
                      <button onClick={() => removeFAQ(idx)} className="text-red-600 text-sm">Remove</button>
                    </div>
                    <div className="text-sm text-gray-600">{item.answer}</div>
                  </div>
                ))}
              </div>
              <button onClick={saveFAQ} className="w-full py-3 rounded-md text-white font-medium" style={{ backgroundColor: saved ? '#16A34A' : '#1565C0' }}>
                {saved ? '✓ Saved!' : 'Save FAQ'}
              </button>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Events</h2>
                <p className="text-gray-600 text-sm mb-6">Create and manage server events. Events appear on the Events section of the homepage. Set start and end dates, add images, and mark as featured to highlight important events.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Event Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="datetime-local" placeholder="Start Date" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="datetime-local" placeholder="End Date" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Image URL" value={eventForm.imageUrl} onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <textarea placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows="4" className="px-4 py-2 border border-gray-300 rounded-md md:col-span-2" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={eventForm.featured} onChange={(e) => setEventForm({ ...eventForm, featured: e.target.checked })} />
                  Featured
                </label>
              </div>
              <button onClick={async () => {
                try {
                  if (!eventForm.title || !eventForm.description || !eventForm.startDate) {
                    alert('Please fill in title, description, and start date')
                    return
                  }
                  const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
                  const method = editingEvent ? 'PUT' : 'POST'
                  const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventForm)
                  })
                  if (res.ok) {
                    await loadAllData()
                    setEventForm({ title: '', description: '', startDate: '', endDate: '', imageUrl: '', location: '', featured: false })
                    setEditingEvent(null)
                    showSaved()
                  } else {
                    alert('Error saving event')
                  }
                } catch (err) {
                  console.error('Error saving event:', err)
                  alert('Error saving event')
                }
              }} className="px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: '#1565C0' }}>
                {editingEvent ? 'Update' : 'Add'} Event
              </button>
              {editingEvent && <button onClick={() => { setEditingEvent(null); setEventForm({ title: '', description: '', startDate: '', endDate: '', imageUrl: '', location: '', featured: false }) }} className="ml-2 px-6 py-2 rounded-md border border-gray-300">Cancel</button>}
              
              <div className="mt-8 space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{event.title}</h3>
                        <p className="text-sm text-gray-600">{new Date(event.start_date).toLocaleString()} - {event.end_date ? new Date(event.end_date).toLocaleString() : 'No end date'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingEvent(event); setEventForm({ title: event.title, description: event.description, startDate: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '', endDate: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '', imageUrl: event.image_url || '', location: event.location || '', featured: event.featured === 1 }) }} className="text-blue-600 text-sm">Edit</button>
                        <button onClick={async () => {
                          if (!confirm('Are you sure you want to delete this event?')) return
                          try {
                            const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
                            if (res.ok) {
                              await loadAllData()
                              showSaved()
                            } else {
                              alert('Error deleting event')
                            }
                          } catch (err) {
                            console.error('Error deleting event:', err)
                            alert('Error deleting event')
                          }
                        }} className="text-red-600 text-sm">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Ranks Tab */}
          {activeTab === 'ranks' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Staff Ranks</h2>
                <p className="text-gray-600 text-sm mb-6">Create and manage staff positions that users can apply for. Each rank can have custom questions and can be opened or closed for applications. Only open ranks are visible to applicants.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Rank Name" value={rankForm.name} onChange={(e) => setRankForm({ ...rankForm, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Description" value={rankForm.description} onChange={(e) => setRankForm({ ...rankForm, description: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-md" />
                <label className="flex items-center gap-2 md:col-span-2">
                  <input type="checkbox" checked={rankForm.open} onChange={(e) => setRankForm({ ...rankForm, open: e.target.checked })} />
                  Open for Applications
                </label>
              </div>
              <div className="mb-6">
                <h3 className="font-bold mb-3">Custom Questions</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Question text" value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 rounded-md" />
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md">
                    <input type="checkbox" checked={newQuestion.required} onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })} />
                    Required
                  </label>
                  <button onClick={() => {
                    if (newQuestion.question) {
                      setRankForm({ ...rankForm, questions: [...rankForm.questions, newQuestion] })
                      setNewQuestion({ question: '', required: true })
                    }
                  }} className="px-4 py-2 rounded-md border border-gray-300">Add Question</button>
                </div>
                <div className="space-y-2">
                  {rankForm.questions.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <span className="font-medium">{q.question}</span>
                        {q.required && <span className="ml-2 text-xs text-red-600">Required</span>}
                      </div>
                      <button onClick={() => setRankForm({ ...rankForm, questions: rankForm.questions.filter((_, i) => i !== idx) })} className="text-red-600 text-sm">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={async () => {
                try {
                  if (!rankForm.name) {
                    alert('Please enter a rank name')
                    return
                  }
                  const url = editingRank ? `/api/staff-ranks/${editingRank.id}` : '/api/staff-ranks'
                  const method = editingRank ? 'PUT' : 'POST'
                  const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...rankForm, orderIndex: editingRank ? editingRank.order_index : (staffRanks?.length || 0) })
                  })
                  if (res.ok) {
                    await loadAllData()
                    setRankForm({ name: '', description: '', questions: [], open: true })
                    setEditingRank(null)
                    showSaved()
                  } else {
                    alert('Error saving rank')
                  }
                } catch (err) {
                  console.error('Error saving rank:', err)
                  alert('Error saving rank')
                }
              }} className="px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: '#1565C0' }}>
                {editingRank ? 'Update' : 'Add'} Rank
              </button>
              {editingRank && <button onClick={() => { setEditingRank(null); setRankForm({ name: '', description: '', questions: [], open: true }) }} className="ml-2 px-6 py-2 rounded-md border border-gray-300">Cancel</button>}
              
              <div className="mt-8 space-y-4">
                {(!staffRanks || staffRanks.length === 0) && <p className="text-gray-500 text-center py-8">No ranks created yet. Create your first rank above.</p>}
                {staffRanks && staffRanks.map((rank) => (
                  <div key={rank.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{rank.name}</h3>
                        <p className="text-sm text-gray-600">{rank.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${rank.open === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {rank.open === 1 ? 'Open' : 'Closed'}
                          </span>
                          <span className="text-xs text-gray-500">{(rank.questions || []).length} question{(rank.questions || []).length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingRank(rank); setRankForm({ name: rank.name || '', description: rank.description || '', questions: Array.isArray(rank.questions) ? rank.questions : [], open: rank.open === 1 }) }} className="text-blue-600 text-sm">Edit</button>
                        <button onClick={async () => {
                          if (!confirm('Are you sure you want to delete this rank?')) return
                          try {
                            const res = await fetch(`/api/staff-ranks/${rank.id}`, { method: 'DELETE' })
                            if (res.ok) {
                              await loadAllData()
                              showSaved()
                            } else {
                              alert('Error deleting rank')
                            }
                          } catch (err) {
                            console.error('Error deleting rank:', err)
                            alert('Error deleting rank')
                          }
                        }} className="text-red-600 text-sm">Delete</button>
                      </div>
                    </div>
                    {rank.questions && Array.isArray(rank.questions) && rank.questions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <strong className="text-sm">Questions:</strong>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {rank.questions.map((q, idx) => (
                            <li key={idx}>{q.question || q} {q.required && <span className="text-red-600">*</span>}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Applications</h2>
                <p className="text-gray-600 text-sm mb-6">Review staff applications submitted by users. You can accept or reject applications. Email notifications will be sent automatically when you change the status.</p>
              </div>
              <div className="space-y-4">
                {staffApplications.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{app.name}</h3>
                        <p className="text-sm text-gray-600">Status: <span className={`font-semibold ${app.status === 'accepted' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{app.status}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          try {
                            const res = await fetch(`/api/staff-applications/${app.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'accepted' }) })
                            if (res.ok) {
                              await loadAllData()
                              showSaved()
                            } else {
                              alert('Error updating application')
                            }
                          } catch (err) {
                            console.error('Error accepting application:', err)
                            alert('Error accepting application')
                          }
                        }} className="px-4 py-2 rounded-md text-white text-sm font-medium" style={{ backgroundColor: '#16A34A' }}>Accept</button>
                        <button onClick={async () => {
                          try {
                            const res = await fetch(`/api/staff-applications/${app.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) })
                            if (res.ok) {
                              await loadAllData()
                              showSaved()
                            } else {
                              alert('Error updating application')
                            }
                          } catch (err) {
                            console.error('Error rejecting application:', err)
                            alert('Error rejecting application')
                          }
                        }} className="px-4 py-2 rounded-md text-white text-sm font-medium" style={{ backgroundColor: '#DC2626' }}>Reject</button>
                        <button onClick={async () => {
                          if (!confirm('Are you sure you want to delete this application?')) return
                          try {
                            const res = await fetch(`/api/staff-applications/${app.id}`, { method: 'DELETE' })
                            if (res.ok) {
                              await loadAllData()
                              showSaved()
                            } else {
                              alert('Error deleting application')
                            }
                          } catch (err) {
                            console.error('Error deleting application:', err)
                            alert('Error deleting application')
                          }
                        }} className="px-4 py-2 rounded-md border border-gray-300 text-sm">Delete</button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Email:</strong> {app.email}</div>
                      <div><strong>Discord:</strong> {app.discord}</div>
                      <div><strong>Age:</strong> {app.age}</div>
                      <div><strong>Minecraft Username:</strong> {app.minecraft_username || 'N/A'}</div>
                    </div>
                    <div className="mt-4">
                      <strong className="block mb-2">Previous Staff Experience:</strong>
                      <p className="text-sm text-gray-700">{app.previous_staff || 'None'}</p>
                    </div>
                    <div className="mt-4">
                      <strong className="block mb-2">Experience & Skills:</strong>
                      <p className="text-sm text-gray-700">{app.experience}</p>
                    </div>
                    <div className="mt-4">
                      <strong className="block mb-2">Why they want to be staff:</strong>
                      <p className="text-sm text-gray-700">{app.why}</p>
                    </div>
                    {app.rank_id && (
                      <div className="mt-4">
                        <strong className="block mb-2">Applied for Rank:</strong>
                        <p className="text-sm text-gray-700">{staffRanks.find(r => r.id === app.rank_id)?.name || 'Unknown'}</p>
                      </div>
                    )}
                    {app.answers && typeof app.answers === 'object' && Object.keys(app.answers).length > 0 && (
                      <div className="mt-4">
                        <strong className="block mb-2">Additional Answers:</strong>
                        {Object.entries(app.answers).map(([idx, answer]) => {
                          const rank = staffRanks.find(r => r.id === app.rank_id)
                          const questions = rank?.questions || []
                          const question = questions[parseInt(idx)]
                          return question ? (
                            <div key={idx} className="mb-2">
                              <p className="text-xs font-medium text-gray-600">{question.question || question}</p>
                              <p className="text-sm text-gray-700">{answer}</p>
                            </div>
                          ) : (
                            <div key={idx} className="mb-2">
                              <p className="text-xs font-medium text-gray-600">Question {parseInt(idx) + 1}</p>
                              <p className="text-sm text-gray-700">{answer}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">Applied: {new Date(app.created_at).toLocaleString()}</div>
                  </div>
                ))}
                {(!staffApplications || staffApplications.length === 0) && <p className="text-gray-500 text-center py-8">No applications submitted yet</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
