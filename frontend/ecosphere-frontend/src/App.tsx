import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Environmental from './pages/Environmental'
import Social from './pages/Social'
import Gamification from './pages/Gamification'
import Governance from './pages/Governance'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

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
      ) : (
        <Dashboard activePage={activePage} onPageChange={setActivePage} />
      )}
    </>
  )
}

export default App
