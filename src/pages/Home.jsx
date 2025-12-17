import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [serverInfo, setServerInfo] = useState(null)
  const [features, setFeatures] = useState([])
  const [rules, setRules] = useState([])
  const [staff, setStaff] = useState([])
  const [faq, setFaq] = useState([])
  const [news, setNews] = useState([])
  const [changelog, setChangelog] = useState([])
  const [gallery, setGallery] = useState([])
  const [shopItems, setShopItems] = useState([])
  const [events, setEvents] = useState([])
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [server, features, rules, staff, faq, news, changelog, gallery, shop, events] = await Promise.all([
          fetch('/data/server_info.json').then(r => r.ok ? r.json() : {}).catch(() => ({})),
          fetch('/data/features.json').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/data/rules.json').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/data/staff.json').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/data/faq.json').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/data/news.json').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/data/changelog.json').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/data/gallery.json').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/data/shop_items.json').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/data/events.json').then(r => r.ok ? r.json() : []).catch(() => []),
        ])
        setServerInfo(server)
        setFeatures(Array.isArray(features) ? features : [])
        setRules(Array.isArray(rules) ? rules : [])
        setStaff(Array.isArray(staff) ? staff : [])
        setFaq(Array.isArray(faq) ? faq : [])
        setNews(Array.isArray(news) ? news : [])
        setChangelog(Array.isArray(changelog) ? changelog : [])
        setGallery(Array.isArray(gallery) ? gallery : [])
        setShopItems(Array.isArray(shop) ? shop : [])
        setEvents(Array.isArray(events) ? events : [])
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    fetchData()

    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleTebexPurchase = (tebexId) => {
    if (tebexId) {
      window.open(`https://aethergens.tebex.io/package/${tebexId}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/90'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="#" className="text-2xl font-bold" style={{ color: '#1565C0' }}>AetherGens</a>
            <div className="flex gap-6 items-center">
              <a href="#news" className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm">News</a>
              <a href="#features" className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm">Features</a>
              <a href="#changelog" className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm">Changelog</a>
              <a href="#gallery" className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm">Gallery</a>
              <a href="#shop" className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm">Shop</a>
              <a href="#events" className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm">Events</a>
              <Link to="/apply" className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm">Apply for Staff</Link>
              <Link to="/admin" className="text-white px-5 py-2 rounded-md transition-colors font-medium text-sm" style={{ backgroundColor: '#1565C0' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#1E6FA8'} onMouseLeave={(e) => e.target.style.backgroundColor = '#1565C0'}>
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Welcome to AetherGens</h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">The Ultimate Minecraft Survival Experience</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="bg-white rounded-lg px-8 py-5 shadow-lg border-2 border-gray-200">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Server IP</div>
              <div className="text-2xl font-bold" style={{ color: '#1565C0' }}>{serverInfo?.serverIp || 'play.aethergens.com'}</div>
            </div>
            <div className="bg-white rounded-lg px-8 py-5 shadow-lg border-2 border-gray-200">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Version</div>
              <div className="text-2xl font-bold" style={{ color: '#1565C0' }}>{serverInfo?.version || '1.20+'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {serverInfo && (
        <section className="max-w-6xl mx-auto px-6 lg:px-8 mb-16">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">👥</div>
              <div className="text-3xl font-bold mb-1" style={{ color: '#1565C0' }}>{serverInfo.onlinePlayers || 0}</div>
              <div className="text-sm text-gray-600 font-medium">Players Online</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">✅</div>
              <div className="text-3xl font-bold text-green-600 mb-1">Online</div>
              <div className="text-sm text-gray-600 font-medium">Server Status</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🌍</div>
              <div className="text-3xl font-bold mb-1" style={{ color: '#1565C0' }}>24/7</div>
              <div className="text-sm text-gray-600 font-medium">Uptime</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">⚡</div>
              <div className="text-3xl font-bold mb-1" style={{ color: '#1565C0' }}>1.20+</div>
              <div className="text-sm text-gray-600 font-medium">Minecraft Version</div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">About AetherGens</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">{serverInfo?.description || 'Discover a new world full of adventure and possibilities on AetherGens.'}</p>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="bg-gray-50 py-16 mb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Latest News</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {news && news.length > 0 ? news.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />}
                <div className="p-6">
                  <div className="text-xs text-gray-500 mb-2">{new Date(item.created_at).toLocaleDateString()}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{item.content}</p>
                  <div className="text-xs text-gray-500 mt-2">By {item.author}</div>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center col-span-3">No news available</p>}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Server Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features && features.length > 0 ? features.map((feature) => (
            <div key={feature.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
            )) : <p className="text-gray-500 text-center col-span-3">No features available</p>}
          </div>
      </section>

      {/* Changelog Section */}
      <section id="changelog" className="bg-gray-50 py-16 mb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Changelog</h2>
          <div className="space-y-4">
            {changelog && changelog.length > 0 ? changelog.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold px-2 py-1 rounded" style={{ backgroundColor: item.type === 'update' ? '#E3F2FD' : '#F3E5F5', color: '#1565C0' }}>{item.type}</span>
                    <span className="ml-3 text-sm font-bold text-gray-900">{item.version}</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            )) : <p className="text-gray-500 text-center">No changelog entries available</p>}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="max-w-6xl mx-auto px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Gallery</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {gallery && gallery.length > 0 ? gallery.slice(0, 6).map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
              </div>
            </div>
            )) : <p className="text-gray-500 text-center col-span-3">No gallery items available</p>}
          </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="bg-gray-50 py-16 mb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Shop</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {shopItems && shopItems.length > 0 ? shopItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">{item.category}</span>
                    {item.featured === 1 && <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-800">Featured</span>}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{ color: '#1565C0' }}>${item.price}</span>
                    <button
                      onClick={() => handleTebexPurchase(item.tebex_id)}
                      className="px-4 py-2 rounded-md text-white font-medium text-sm transition-colors"
                      style={{ backgroundColor: '#1565C0' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1E6FA8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#1565C0'}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center col-span-3">No shop items available</p>}
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section id="rules" className="max-w-4xl mx-auto px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Server Rules</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {rules && rules.length > 0 ? rules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-lg p-4 shadow-sm border-l-4 flex items-start gap-3" style={{ borderLeftColor: '#1565C0' }}>
              <div className="font-bold mt-0.5" style={{ color: '#1565C0' }}>✓</div>
              <p className="text-gray-700 font-medium text-sm">{rule.rule_text}</p>
            </div>
            )) : <p className="text-gray-500 text-center col-span-2">No rules available</p>}
          </div>
      </section>

      {/* Staff Section */}
      <section id="staff" className="bg-gray-50 py-16 mb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Team</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {staff && staff.length > 0 ? staff.map((member) => (
              <div key={member.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl text-white" style={{ backgroundColor: member.color }}>
                  👤
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            )) : <p className="text-gray-500 text-center col-span-4">No staff members available</p>}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="bg-gray-50 py-16 mb-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Upcoming Events</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {events && events.length > 0 ? events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {event.image_url && <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />}
                <div className="p-6">
                  {event.featured === 1 && <span className="text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-800 mb-2 inline-block">Featured</span>}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                  <div className="text-sm text-gray-500">
                    <p><strong>Start:</strong> {new Date(event.start_date).toLocaleString()}</p>
                    {event.end_date && <p><strong>End:</strong> {new Date(event.end_date).toLocaleString()}</p>}
                    {event.location && <p><strong>Location:</strong> {event.location}</p>}
                  </div>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center col-span-2">No events scheduled</p>}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faq && faq.length > 0 ? faq.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.question}</h3>
              <p className="text-gray-700">{item.answer}</p>
            </div>
            )) : <p className="text-gray-500 text-center">No FAQ items available</p>}
          </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: '#1565C0' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold mb-4">AetherGens</div>
          <p className="text-blue-200 mb-6">The Ultimate Minecraft Survival Experience</p>
          <div className="flex justify-center gap-6 mb-6">
            <a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Discord</a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Twitter</a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">YouTube</a>
          </div>
          <p className="text-blue-300 text-xs">© 2024 AetherGens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
