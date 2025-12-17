import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import AdminPanel from './pages/AdminPanel'
import StaffApplication from './pages/StaffApplication'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/apply" element={<StaffApplication />} />
      </Routes>
    </Router>
  )
}

export default App

