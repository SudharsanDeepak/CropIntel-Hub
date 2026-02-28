import { Link } from 'react-router-dom'
import { Menu, Bell, RefreshCw, TrendingUp, LogOut, User } from 'lucide-react'
import { useMarketData } from '../../hooks/useMarketData'
import { useAuth } from '../../context/AuthContext'
const Navbar = ({ onMenuClick }) => {
  const { useUpdateMarketData } = useMarketData()
  const { user, logout, setIsLoginOpen, setIsSignupOpen } = useAuth()
  const updateMutation = useUpdateMarketData()
  const handleRefresh = () => {
    updateMutation.mutate()
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="lg:pl-0">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {}
          <div className="flex items-center space-x-3 lg:w-64 lg:pl-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center group lg:-ml-4">
              <img 
                src="/cropintelhub-logo.png" 
                alt="CropIntel HUB" 
                className="h-24 w-auto sm:h-32 md:h-36 lg:h-40"
              />
            </Link>
          </div>
          {}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {}
            <button
              onClick={handleRefresh}
              disabled={updateMutation.isLoading}
              className="p-2 sm:p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 tap-target flex items-center justify-center"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw 
                className={`h-4 w-4 sm:h-5 sm:w-5 ${updateMutation.isLoading ? 'animate-spin' : ''}`} 
              />
            </button>
            {}
            {user && (
              <Link
                to="/alerts"
                className="p-2 sm:p-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative tap-target flex items-center justify-center"
                title="Alerts"
                aria-label="View alerts"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-2 w-2 bg-tertiary-500 rounded-full ring-2 ring-white"></span>
              </Link>
            )}
            {}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-secondary-50 rounded-lg border border-secondary-200">
              <div className="h-2 w-2 bg-secondary-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-secondary-700">Live</span>
            </div>
            {}
            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2 ml-1 sm:ml-2">
                <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <div className="p-1 bg-white rounded-full">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 sm:p-2.5 rounded-lg text-gray-600 hover:text-tertiary-600 hover:bg-tertiary-50 transition-colors tap-target flex items-center justify-center"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2 ml-1 sm:ml-2">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors tap-target"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsSignupOpen(true)}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm hover:shadow-md tap-target"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
export default Navbar