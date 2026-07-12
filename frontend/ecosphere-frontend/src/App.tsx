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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = () => {
    setIsAuthenticated(false)
    setActivePage('Dashboard')
  }

  if (!isAuthenticated) {
    if (showAuth) {
      return <Auth onLogin={() => setIsAuthenticated(true)} onBack={() => setShowAuth(false)} />
    }
    return <Landing onNavigateToAuth={() => setShowAuth(true)} />
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {activePage === 'Environmental' ? (
        <Environmental activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Social' ? (
        <Social activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Gamification' ? (
        <Gamification activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Governance' ? (
        <Governance activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Reports' ? (
        <Reports activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Settings' ? (
        <Settings activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Notifications' ? (
        <Notifications activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />
      ) : activePage === 'Profile' ? (
        <Profile activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} />
      ) : (
        <Dashboard activePage={activePage} onPageChange={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />
      )}
    </div>
  )
}

export default App
