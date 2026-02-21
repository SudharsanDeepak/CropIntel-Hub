import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

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
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchCurrentUser(token)
    } else {
      setLoading(false)
    }
  }, [])
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
  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
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