import axios from 'axios'
import { Capacitor } from '@capacitor/core'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance with mobile-friendly configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for logging and mobile-specific headers
axiosInstance.interceptors.request.use(
  (config) => {
    const isNative = Capacitor.isNativePlatform()
    
    console.log('[Axios] Request:', {
      method: config.method,
      url: config.url,
      isNative,
      headers: config.headers,
    })
    
    // Add mobile app identifier
    if (isNative) {
      config.headers['X-Requested-With'] = 'CropIntelHub-Mobile'
      config.headers['X-Platform'] = Capacitor.getPlatform()
    }
    
    return config
  },
  (error) => {
    console.error('[Axios] Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[Axios] Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error('[Axios] Response error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    })
    
    // Provide user-friendly error messages
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timeout. Please check your connection.'
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.userMessage = 'Network error. Please check your internet connection.'
    } else if (error.response?.status === 401) {
      error.userMessage = 'Authentication failed. Please log in again.'
    } else if (error.response?.status === 403) {
      error.userMessage = 'Access denied.'
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server error. Please try again later.'
    } else {
      error.userMessage = error.response?.data?.message || 'An error occurred.'
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance
export { API_URL }
