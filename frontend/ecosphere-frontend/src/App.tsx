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

  if (!isAuthenticated) {
    if (showAuth) {
      return <Auth onLogin={() => setIsAuthenticated(true)} onBack={() => setShowAuth(false)} />
    }
    return <Landing onNavigateToAuth={() => setShowAuth(true)} />
  }

  return (
    <>
      {activePage === 'Environmental' ? (
        <Environmental activePage={activePage} onPageChange={setActivePage} />
      ) : activePage === 'Social' ? (
        <Social activePage={activePage} onPageChange={setActivePage} />
      ) : activePage === 'Gamification' ? (
        <Gamification activePage={activePage} onPageChange={setActivePage} />
      ) : activePage === 'Governance' ? (
        <Governance activePage={activePage} onPageChange={setActivePage} />
      ) : activePage === 'Reports' ? (
        <Reports activePage={activePage} onPageChange={setActivePage} />
      ) : activePage === 'Settings' ? (
        <Settings activePage={activePage} onPageChange={setActivePage} />
      ) : activePage === 'Notifications' ? (
        <Notifications activePage={activePage} onPageChange={setActivePage} />
      ) : activePage === 'Profile' ? (
        <Profile activePage={activePage} onPageChange={setActivePage} />
      ) : (
        <Dashboard activePage={activePage} onPageChange={setActivePage} />
      )}
    </>
  )
}

export default App
