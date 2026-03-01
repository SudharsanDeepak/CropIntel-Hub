import { NavLink } from 'react-router-dom'
import { X, Home, DollarSign, TrendingUp, GitCompare, BarChart3, Bell, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Capacitor } from '@capacitor/core'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, setIsLoginOpen } = useAuth()
  const isNative = Capacitor.isNativePlatform()
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/', public: true },
    { icon: DollarSign, label: 'Price Tracker', path: '/tracker', public: false },
    { icon: TrendingUp, label: 'Forecast', path: '/forecast', public: false },
    { icon: GitCompare, label: 'Compare', path: '/compare', public: false },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', public: false },
    { icon: Bell, label: 'Alerts', path: '/alerts', public: false },
  ]
  
  const handleProtectedClick = (e, item) => {
    if (!user && !item.public) {
      e.preventDefault()
      onClose()
      setIsLoginOpen(true)
    }
  }
  
  return (
    <>
      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      {}
      <aside
        className={`
          fixed left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 shadow-lg lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isNative ? 'top-[calc(4rem+env(safe-area-inset-top))]' : 'top-16'}
        `}
      >
        <div className="h-full overflow-y-auto py-6">
          {}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          
          {}
          {!user && (
            <div className="mx-3 mb-4 p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl border border-primary-200/50 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Unlock All Features</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Sign in to track prices, set alerts, and access personalized insights
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  handleProtectedClick(e, item)
                  if (user || item.public) onClose()
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                      : !user && !item.public
                      ? 'text-gray-400 hover:bg-gray-50 font-medium cursor-pointer'
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <item.icon className={`h-5 w-5 ${
                        isActive 
                          ? 'text-primary-600' 
                          : !user && !item.public 
                          ? 'text-gray-400' 
                          : 'text-gray-500'
                      }`} />
                      <span>{item.label}</span>
                    </div>
                    {!user && !item.public && (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
export default Sidebar