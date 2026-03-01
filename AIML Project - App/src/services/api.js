import axiosInstance from '../utils/axiosConfig'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Use the configured axios instance that handles Capacitor HTTP
const api = axiosInstance

// Response interceptor for data extraction and error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle case where error object might be undefined or malformed
    if (!error) {
      console.error('Unknown error occurred')
      return Promise.reject(new Error('An unknown error occurred'))
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - ML API is processing large dataset')
      return Promise.reject(new Error('Request timeout. The server is processing a large dataset. Please try again.'))
    }
    
    const message = error.userMessage || error.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export const marketAPI = {
  getDemandForecast: (days = 7) => 
    api.get(`/api/demand?days=${days}`),
  getPriceForecast: (days = 7) => 
    api.get(`/api/price?days=${days}`),
  getStockAnalysis: (days = 7) => 
    api.get(`/api/stock?days=${days}`),
  getElasticity: () => 
    api.get('/api/elasticity'),
  getDataSources: () => 
    api.get('/api/data/sources'),
  updateMarketData: () => 
    api.post('/api/data/update', {}),
}

export default api