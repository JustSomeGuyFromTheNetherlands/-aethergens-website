import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === 'ik hou van kaas') {
      navigate('/admin/panel')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full border border-gray-200">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="text-gray-600 mt-2 text-sm">Enter your password to access the admin panel</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1565C0'}
              onBlur={(e) => e.target.style.boxShadow = ''}
              placeholder="Enter password"
            />
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full text-white py-2 rounded-md transition-colors font-medium"
            style={{ backgroundColor: '#1565C0' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1E6FA8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1565C0'}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
