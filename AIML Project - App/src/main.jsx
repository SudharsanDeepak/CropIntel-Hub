import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'
import { StatusBar } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, 
    },
  },
})

// Initialize StatusBar plugin before React renders (mobile only)
if (Capacitor.isNativePlatform()) {
  try {
    StatusBar.setOverlaysWebView({ overlay: false })
    StatusBar.setStyle({ style: 'Light' })
    StatusBar.setBackgroundColor({ color: '#FFFFFF' })
  } catch (error) {
    console.log('StatusBar plugin not available:', error)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <App />
          <Toaster 
            position="bottom-left"
            gutter={12}
            containerStyle={{
              bottom: '24px',
              left: '24px',
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                maxWidth: '400px',
              },
              success: {
                duration: 3000,
                style: {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              error: {
                duration: 3000,
                style: {
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)