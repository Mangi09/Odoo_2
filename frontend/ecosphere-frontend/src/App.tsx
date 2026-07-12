import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Environmental from './pages/Environmental'
import Social from './pages/Social'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  return (
    <>
      {activePage === 'Environmental' ? (
        <Environmental activePage={activePage} onPageChange={setActivePage} />
      ) : activePage === 'Social' ? (
        <Social activePage={activePage} onPageChange={setActivePage} />
      ) : (
        <Dashboard activePage={activePage} onPageChange={setActivePage} />
      )}
    </>
  )
}

export default App
