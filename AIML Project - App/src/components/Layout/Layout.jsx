import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useState } from 'react'
import { Capacitor } from '@capacitor/core'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isNative = Capacitor.isNativePlatform()
  
  return (
    <div className={`min-h-screen bg-gray-50 ${isNative ? 'safe-area-top' : ''}`}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 pt-16 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
export default Layout