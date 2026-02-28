import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import PriceTracker from './pages/PriceTracker'
import Forecast from './pages/Forecast'
import Compare from './pages/Compare'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import NotFound from './pages/NotFound'
import AuthCallback from './pages/AuthCallback'
import LoginModal from './components/Auth/LoginModal'
import SignupModal from './components/Auth/SignupModal'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import MarketGuide from './components/MarketGuide'

function App() {
  const { user } = useAuth()
  
  return (
    <>
      <Routes key={user ? user.id : 'logged-out'}>
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Public Dashboard Route */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
        </Route>
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="tracker" element={<PriceTracker />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="compare" element={<Compare />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <LoginModal />
      <SignupModal />
      <MarketGuide />
    </>
  )
}

export default App