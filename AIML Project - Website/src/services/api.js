import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, 
  headers: {
    'Content-Type': 'application/json',
  },
})
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - ML API is processing large dataset')
      return Promise.reject(new Error('Request timeout. The server is processing a large dataset. Please try again.'))
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)
export const marketAPI = {
  getDemandForecast: (days = 7) => 
    api.get(`/api/demand?days=${days}`, { timeout: 120000 }),
  getPriceForecast: (days = 7) => 
    api.get(`/api/price?days=${days}`, { timeout: 120000 }),
  getStockAnalysis: (days = 7) => 
    api.get(`/api/stock?days=${days}`, { timeout: 60000 }),
  getElasticity: () => 
    api.get('/api/elasticity', { timeout: 60000 }),
  getDataSources: () => 
    api.get('/api/data/sources', { timeout: 30000 }),
  updateMarketData: () => 
    api.post('/api/data/update', {}, { timeout: 180000 }), 
}
export default api