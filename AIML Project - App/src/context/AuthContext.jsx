import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance, { API_URL } from '../utils/axiosConfig'
import toast from 'react-hot-toast'
import { App as CapacitorApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  
  const isNativePlatform = Capacitor.isNativePlatform()
  
  useEffect(() => {
    // Check for token in localStorage first
    const token = localStorage.getItem('token')
    
    // Also check if we just came back from OAuth (check URL for deep link params)
    const checkForOAuthCallback = async () => {
      if (isNativePlatform) {
        // On native, check if there's a pending deep link
        console.log('[AuthContext] Checking for pending OAuth callback')
        
        // Try to get the launch URL (if app was opened via deep link)
        try {
          const { url } = await CapacitorApp.getLaunchUrl() || {}
          if (url && url.includes('auth/callback')) {
            console.log('[AuthContext] Found launch URL with callback:', url)
            const urlObj = new URL(url)
            const deepLinkToken = urlObj.searchParams.get('token')
            if (deepLinkToken) {
              console.log('[AuthContext] Found token in launch URL')
              localStorage.setItem('token', deepLinkToken)
              await fetchCurrentUser(deepLinkToken)
              return
            }
          }
        } catch (error) {
          console.log('[AuthContext] No launch URL or error:', error)
        }
      }
      
      // If we have a token in localStorage, fetch user
      if (token) {
        console.log('[AuthContext] Found token in localStorage')
        fetchCurrentUser(token)
      } else {
        console.log('[AuthContext] No token found')
        setLoading(false)
      }
    }
    
    checkForOAuthCallback()
    
    // Setup deep link listener for mobile app
    if (!isNativePlatform) {
      console.log('[DeepLink] Not native platform, skipping deep link setup')
      return
    }

    console.log('[DeepLink] Setting up deep link listener for native platform')
    let listener = null

    const setupDeepLinks = async () => {
      try {
        listener = await CapacitorApp.addListener('appUrlOpen', async (event) => {
          console.log('[DeepLink] Deep link received:', event.url)
          
          // Handle OAuth callback: cropintelhub://auth/callback?token=xxx
          if (event.url.includes('auth/callback')) {
            try {
              const url = new URL(event.url)
              const token = url.searchParams.get('token')
              const error = url.searchParams.get('error')
              
              console.log('[DeepLink] Callback params - token:', token ? 'present' : 'missing', 'error:', error || 'none')
              
              // Close the in-app browser AFTER we have the token
              try {
                await Browser.close()
                console.log('[DeepLink] Browser closed successfully')
              } catch (error) {
                console.log('[DeepLink] Browser already closed or not open')
              }
              
              if (token) {
                console.log('[DeepLink] Saving token to localStorage')
                localStorage.setItem('token', token)
                console.log('[DeepLink] Fetching user data')
                
                // Fetch user and wait for it to complete
                await fetchCurrentUser(token)
                
                // Force a page reload to ensure the app shows logged-in state
                console.log('[DeepLink] Reloading app to show logged-in state')
                window.location.href = '/'
              } else if (error) {
                console.error('[DeepLink] OAuth error:', error)
                toast.error('Authentication failed. Please try again.')
              } else {
                console.error('[DeepLink] Deep link missing token and error parameters')
                toast.error('Invalid authentication link')
              }
            } catch (error) {
              console.error('[DeepLink] Failed to parse deep link:', error)
              toast.error('Invalid authentication link')
            }
          }
        })
        console.log('[DeepLink] Listener registered successfully')
      } catch (error) {
        console.error('[DeepLink] Failed to setup listener:', error)
      }
    }
    
    setupDeepLinks()

    // Cleanup listener on unmount
    return () => {
      if (listener) {
        console.log('[DeepLink] Removing listener')
        listener.remove()
      }
    }
  }, [isNativePlatform])
  const fetchCurrentUser = async (token) => {
    try {
      setLoading(true)
      console.log('[AuthContext] Fetching current user')
      
      const response = await axiosInstance.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      console.log('[AuthContext] Raw response:', response)
      console.log('[AuthContext] Response.data:', response.data)
      console.log('[AuthContext] Response.data type:', typeof response.data)
      console.log('[AuthContext] Response.data keys:', response.data ? Object.keys(response.data) : 'no data')
      
      // Try to access data directly
      const data = response.data
      console.log('[AuthContext] Extracted data:', data)
      console.log('[AuthContext] Data.success:', data?.success)
      console.log('[AuthContext] Data.user:', data?.user)
      
      if (data && data.success && data.user) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('[AuthContext] User authenticated:', data.user.email)
      } else {
        console.log('[AuthContext] Auth failed - data:', data)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    } catch (error) {
      console.error('[AuthContext] Fetch user error:', error)
      
      // Don't clear token on network errors
      if (error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK' || !error?.response) {
        console.log('[AuthContext] Network error - keeping token')
        toast.error('Network error. Please check your connection.')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }
  const sendOTPSignup = async (email) => {
    try {
      const response = await axiosInstance.post('/api/auth/send-otp-signup', {
        email,
      })
      if (response.data.success) {
        if (response.data.devMode && response.data.otp) {
          toast.success(`${response.data.message}`, { duration: 10000 })
        } else {
          toast.success(response.data.message)
        }
        return { success: true, devMode: response.data.devMode, otp: response.data.otp }
      }
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Failed to send OTP'
      toast.error(message)
      return { success: false, error: message }
    }
  }
  const verifyOTPSignup = async (name, email, password, otp) => {
    try {
      const response = await axiosInstance.post('/api/auth/verify-otp-signup', {
        name,
        email,
        password,
        otp,
      })
      if (response.data.success) {
        const { token, user } = response.data
        setUser(user)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
        toast.success('Account created successfully!')
        setIsSignupOpen(false)
        return { success: true }
      }
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Verification failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }
  const sendOTPLogin = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/send-otp-login', {
        email,
        password,
      })
      if (response.data.success) {
        if (response.data.devMode && response.data.otp) {
          toast.success(`${response.data.message}`, { duration: 10000 })
        } else {
          toast.success(response.data.message)
        }
        return { success: true, devMode: response.data.devMode, otp: response.data.otp }
      }
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Failed to send OTP'
      toast.error(message)
      return { success: false, error: message }
    }
  }
  const verifyOTPLogin = async (email, otp) => {
    try {
      const response = await axiosInstance.post('/api/auth/verify-otp-login', {
        email,
        otp,
      })
      if (response.data.success) {
        const { token, user } = response.data
        setUser(user)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
        toast.success('Welcome back!')
        setIsLoginOpen(false)
        return { success: true }
      }
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Verification failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }
  const loginWithGoogle = async () => {
    console.log('[OAuth] Login with Google clicked')
    console.log('[OAuth] Is native platform:', isNativePlatform)
    
    if (isNativePlatform) {
      // Mobile app: Open OAuth in in-app browser with redirect to deep link
      const authUrl = `${API_URL}/api/auth/google?redirect=app`
      console.log('[OAuth] Opening browser with URL:', authUrl)
      
      try {
        await Browser.open({ 
          url: authUrl,
          presentationStyle: 'popover'
        })
        console.log('[OAuth] Browser opened successfully')
      } catch (error) {
        console.error('[OAuth] Failed to open browser:', error)
        toast.error('Failed to open login browser')
      }
    } else {
      // Web: Use regular redirect
      console.log('[OAuth] Web redirect to:', `${API_URL}/api/auth/google`)
      window.location.href = `${API_URL}/api/auth/google`
    }
  }
  const logout = () => {
    // Clear all auth data from localStorage first
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // Clear user state
    setUser(null)
    
    // Show success message
    toast.success('Logged out successfully')
    
    // Immediately reload to show login screen
    // Using replace to prevent back button from showing logged-in state
    window.location.replace('/')
  }
  const value = {
    user,
    loading,
    sendOTPSignup,
    verifyOTPSignup,
    sendOTPLogin,
    verifyOTPLogin,
    loginWithGoogle,
    logout,
    isLoginOpen,
    setIsLoginOpen,
    isSignupOpen,
    setIsSignupOpen,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}