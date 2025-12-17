import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function StaffApplication() {
  const [ranks, setRanks] = useState([])
  const [selectedRank, setSelectedRank] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    discord: '',
    age: '',
    minecraftUsername: '',
    previousStaff: '',
    experience: '',
    why: '',
    answers: {}
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch('/data/staff_ranks.json')
      .then(res => {
        if (!res.ok) {
          console.error('Error fetching ranks:', res.status)
          return []
        }
        return res.json()
      })
      .then(data => {
        // Filter only open ranks
        const openRanks = (data || []).filter(rank => rank.open === true || rank.open === 1)
        setRanks(openRanks)
      })
      .catch(err => {
        console.error('Error fetching ranks:', err)
        setRanks([])
      })
  }, [])

  const handleRankSelect = (rank) => {
    setSelectedRank(rank)
    setFormData({ ...formData, answers: {} })
  }

  const handleAnswerChange = (questionIndex, value) => {
    setFormData({
      ...formData,
      answers: {
        ...formData.answers,
        [questionIndex]: value
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/staff-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rankId: selectedRank.id,
          age: parseInt(formData.age)
        })
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        alert('Error submitting application. Please try again.')
      }
    } catch (err) {
      alert('Error submitting application. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">Thank you for your interest in joining our staff team. We will review your application and contact you soon.</p>
          <Link to="/" className="px-6 py-2 rounded-md text-white font-medium inline-block" style={{ backgroundColor: '#1565C0' }}>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold" style={{ color: '#1565C0' }}>AetherGens</Link>
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Apply for Staff</h1>
          <p className="text-center text-gray-600 mb-8">Choose a position and fill out the application form</p>

          {!selectedRank ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Positions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {ranks && ranks.length > 0 ? ranks.map((rank) => (
                  <div
                    key={rank.id}
                    onClick={() => handleRankSelect(rank)}
                    className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{rank.name}</h3>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">Open</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{rank.description}</p>
                    <p className="text-xs text-gray-500">{rank.questions.length} question{rank.questions.length !== 1 ? 's' : ''}</p>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-500 text-lg">No positions are currently open for applications.</p>
                    <p className="text-gray-400 text-sm mt-2">Please check back later!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Applying for: {selectedRank.name}</h2>
                  <p className="text-gray-600 text-sm">{selectedRank.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRank(null)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium"
                >
                  Change Position
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Discord Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.discord}
                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Age *</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2 font-medium">Minecraft Username</label>
                  <input
                    type="text"
                    value={formData.minecraftUsername}
                    onChange={(e) => setFormData({ ...formData, minecraftUsername: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Previous Staff Experience *</label>
                <textarea
                  required
                  value={formData.previousStaff}
                  onChange={(e) => setFormData({ ...formData, previousStaff: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="List any previous staff experience on other servers"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Experience & Skills *</label>
                <textarea
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us about your experience with Minecraft, moderation, etc."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Why do you want to be staff? *</label>
                <textarea
                  required
                  value={formData.why}
                  onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Explain why you want to join our staff team"
                />
              </div>

              {selectedRank.questions && Array.isArray(selectedRank.questions) && selectedRank.questions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Questions</h3>
                  <div className="space-y-4">
                    {selectedRank.questions.map((q, idx) => (
                      <div key={idx}>
                        <label className="block text-gray-700 mb-2 font-medium">
                          {q.question || q} {q.required && '*'}
                        </label>
                        <textarea
                          required={q.required}
                          value={formData.answers[idx] || ''}
                          onChange={(e) => handleAnswerChange(idx, e.target.value)}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-md text-white font-medium transition-colors"
                  style={{ backgroundColor: '#1565C0' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1E6FA8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#1565C0'}
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRank(null)
                    setFormData({
                      name: '',
                      email: '',
                      discord: '',
                      age: '',
                      minecraftUsername: '',
                      previousStaff: '',
                      experience: '',
                      why: '',
                      answers: {}
                    })
                  }}
                  className="px-6 py-3 rounded-md border border-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

