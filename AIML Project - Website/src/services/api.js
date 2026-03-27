import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const CACHE_PREFIX = 'cropintel_cache_v1:'

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
    const normalizedError = new Error(message)
    normalizedError.response = error.response
    normalizedError.code = error.code
    normalizedError.status = error.response?.status
    return Promise.reject(normalizedError)
  }
)

const getCachedValue = (key) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.value ?? null
  } catch {
    return null
  }
}

const setCachedValue = (key, value) => {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({
        timestamp: Date.now(),
        value,
      })
    )
  } catch {
    // Ignore storage quota or serialization errors.
  }
}

const getWithFallback = async (path, { cacheKey, timeout = 30000, fallbackValue = [] } = {}) => {
  try {
    const data = await api.get(path, { timeout })
    if (cacheKey) {
      setCachedValue(cacheKey, data)
    }
    return data
  } catch (error) {
    const status = error.status || error.response?.status
    const shouldUseCache = status === 429 || status >= 500 || error.code === 'ERR_NETWORK'

    if (cacheKey && shouldUseCache) {
      const cached = getCachedValue(cacheKey)
      if (cached !== null) {
        console.warn(`Using cached response for ${path} due to upstream error (${status || error.code || 'unknown'})`)
        return cached
      }

      return fallbackValue
    }

    throw error
  }
}
export const marketAPI = {
  getDemandForecast: (days = 7) => 
    getWithFallback(`/api/demand?days=${days}`, {
      cacheKey: `demand:${days}`,
      timeout: 120000,
      fallbackValue: [],
    }),
  getPriceForecast: (days = 7) => 
    getWithFallback(`/api/price?days=${days}`, {
      cacheKey: `price:${days}`,
      timeout: 120000,
      fallbackValue: [],
    }),
  getStockAnalysis: (days = 7) => 
    getWithFallback(`/api/stock?days=${days}`, {
      cacheKey: `stock:${days}`,
      timeout: 60000,
      fallbackValue: [],
    }),
  getElasticity: () => 
    getWithFallback('/api/elasticity', {
      cacheKey: 'elasticity',
      timeout: 60000,
      fallbackValue: [],
    }),
  getDataSources: () => 
    getWithFallback('/api/data/sources', {
      cacheKey: 'data-sources',
      timeout: 30000,
      fallbackValue: [],
    }),
  updateMarketData: () => 
    api.post('/api/data/update', {}, { timeout: 180000 }), 
}
export default api