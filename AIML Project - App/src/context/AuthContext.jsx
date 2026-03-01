import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { App as CapacitorApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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
    const token = localStorage.getItem('token')
    if (token) {
      fetchCurrentUser(token)
    } else {
      setLoading(false)
    }
    
    // Setup deep link listener for mobile app
    if (!isNativePlatform) return

    let listener = null

    const setupDeepLinks = async () => {
      listener = await CapacitorApp.addListener('appUrlOpen', async (event) => {
        console.log('Deep link received:', event.url)
        
        // Close the in-app browser immediately
        try {
          await Browser.close()
        } catch (error) {
          console.log('Browser already closed or not open')
        }
        
        // Handle OAuth callback: cropintelhub://auth/callback?token=xxx
        if (event.url.includes('auth/callback')) {
          try {
            const url = new URL(event.url)
            const token = url.searchParams.get('token')
            const error = url.searchParams.get('error')
            
            if (token) {
              console.log('Token received from OAuth:', token)
              localStorage.setItem('token', token)
              await fetchCurrentUser(token)
              toast.success('Welcome back!')
              setIsLoginOpen(false)
            } else if (error) {
              console.error('OAuth error:', error)
              toast.error('Authentication failed. Please try again.')
            } else {
              console.error('Deep link missing token and error parameters')
              toast.error('Invalid authentication link')
            }
          } catch (error) {
            console.error('Failed to parse deep link:', error)
            toast.error('Invalid authentication link')
          }
        }
      })
    }
    
    setupDeepLinks()

    // Cleanup listener on unmount
    return () => {
      if (listener) {
        listener.remove()
      }
    }
  }, [isNativePlatform])
  const fetchCurrentUser = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }
  const sendOTPSignup = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp-signup`, {
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
      const message = error.response?.data?.message || 'Failed to send OTP'
      toast.error(message)
      return { success: false, error: message }
    }
  }
  const verifyOTPSignup = async (name, email, password, otp) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp-signup`, {
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
      const message = error.response?.data?.message || 'Verification failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }
  const sendOTPLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp-login`, {
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
      const message = error.response?.data?.message || 'Failed to send OTP'
      toast.error(message)
      return { success: false, error: message }
    }
  }
  const verifyOTPLogin = async (email, otp) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp-login`, {
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
      const message = error.response?.data?.message || 'Verification failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }
  const loginWithGoogle = async () => {
    if (isNativePlatform) {
      // Mobile app: Open OAuth in in-app browser with redirect to deep link
      const authUrl = `${API_URL}/api/auth/google?redirect=app`
      await Browser.open({ 
        url: authUrl,
        presentationStyle: 'popover'
      })
    } else {
      // Web: Use regular redirect
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