import { useState } from 'react'
import { LoginPage, DashboardPage } from './pages'
import { hasSavedAccessSession, revokeAccessSession } from './utils'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasSavedAccessSession)

  const handleAuthenticated = () => setIsAuthenticated(true)

  const handleLogout = () => {
    revokeAccessSession()
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onAuthenticated={handleAuthenticated} />
  }

  return <DashboardPage onLogout={handleLogout} />
}

export default App
