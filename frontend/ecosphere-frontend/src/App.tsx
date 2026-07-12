import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Environmental from './pages/Environmental'
import Social from './pages/Social'
import Gamification from './pages/Gamification'
import Governance from './pages/Governance'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import Landing from './pages/Landing'
import { useAuth } from './context/AuthContext'

function App() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')
  const [darkMode, setDarkMode] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading EcoSphere...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showAuth) {
      return <Auth onLogin={() => setShowAuth(false)} onBack={() => setShowAuth(false)} />
    }
    return <Landing onNavigateToAuth={() => setShowAuth(true)} />
  }

  const handlePageChange = (page: string) => {
    if (page === 'Logout') {
      logout()
      setShowAuth(false)
      return
    }
    setActivePage(page)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {activePage === 'Environmental' ? (
        <Environmental activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Social' ? (
        <Social activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Gamification' ? (
        <Gamification activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Governance' ? (
        <Governance activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Reports' ? (
        <Reports activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Settings' ? (
        <Settings activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Notifications' ? (
        <Notifications activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Profile' ? (
        <Profile activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : (
        <Dashboard activePage={activePage} onPageChange={handlePageChange} darkMode={darkMode} setDarkMode={setDarkMode} />
      )}
    </div>
  )
}

export default App
