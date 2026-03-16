// import { useState } from 'react'
// import { LoginPage, DashboardPage } from './pages'
// import { hasSavedAccessSession, revokeAccessSession } from './utils'
import { TemporaryDownPage } from './pages/TemporaryDownPage'

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(hasSavedAccessSession)

  // const handleAuthenticated = () => setIsAuthenticated(true)

  // const handleLogout = () => {
  //   revokeAccessSession()
  //   setIsAuthenticated(false)
  // }

  // Temporary maintenance mode: always show "site down" screen
  return <TemporaryDownPage />
}

export default App
