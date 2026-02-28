import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, LogIn, UserPlus, X } from 'lucide-react'

const ProtectedRoute = ({ children }) => {
  const { user, loading, setIsLoginOpen, setIsSignupOpen } = useAuth()
  const location = useLocation()

  // Check for token on mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token && !loading) {
      // No token found, user needs to log in
      console.log('No token found, authentication required')
    }
  }, [location, loading])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show modal overlay instead of full page
  if (!user) {
    return (
      <>
        {/* Blurred background with content */}
        <div className="min-h-screen bg-gray-50 filter blur-sm pointer-events-none">
          {children}
        </div>
        
        {/* Authentication Modal Overlay */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">Authentication Required</h2>
                  <p className="text-primary-100 text-center text-sm">
                    Please sign in to access CropIntel HUB features
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    Sign in to track prices, view forecasts, set alerts, and access personalized market insights.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsLoginOpen(false)
                      setIsSignupOpen(true)
                    }}
                    className="w-full bg-white text-primary-600 py-3 px-6 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 flex items-center justify-center gap-2 border-2 border-primary-600"
                  >
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </button>
                </div>

                {/* Features List */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3">With an account you can:</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">✓</span>
                      <span>Track real-time prices for 180+ products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">✓</span>
                      <span>Get 7-day price and demand forecasts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">✓</span>
                      <span>Set personalized price alerts via email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-600 mt-0.5">✓</span>
                      <span>Compare products and analyze trends</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </>
    )
  }

  // User is authenticated, render the protected content
  return children
}

export default ProtectedRoute
