import axiosInstance from '../utils/axiosConfig'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const CACHE_PREFIX = 'cropintel_cache_v1:'
const RATE_LIMIT_PREFIX = 'cropintel_rate_limit_v1:'
const inFlightRequests = new Map()

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

const buildRequestKey = (path, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {})

  return `${path}:${JSON.stringify(sortedParams)}`
}

const setRateLimitCooldown = (requestKey, retryAfterHeader) => {
  let retryAfterMs = 5000

  if (retryAfterHeader) {
    const retryAfterSeconds = Number(retryAfterHeader)
    if (Number.isFinite(retryAfterSeconds)) {
      retryAfterMs = Math.max(1000, retryAfterSeconds * 1000)
    } else {
      const retryDate = Date.parse(retryAfterHeader)
      if (!Number.isNaN(retryDate)) {
        retryAfterMs = Math.max(1000, retryDate - Date.now())
      }
    }
  }

  const expiresAt = Date.now() + retryAfterMs

  try {
    localStorage.setItem(`${RATE_LIMIT_PREFIX}${requestKey}`, String(expiresAt))
  } catch {
    // Ignore storage failures.
  }
}

const isRateLimited = (requestKey) => {
  try {
    const raw = localStorage.getItem(`${RATE_LIMIT_PREFIX}${requestKey}`)
    if (!raw) return false

    const expiresAt = Number(raw)
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(`${RATE_LIMIT_PREFIX}${requestKey}`)
      return false
    }

    return true
  } catch {
    return false
  }
}

const getWithFallback = async (
  path,
  {
    cacheKey,
    timeout = 30000,
    fallbackValue = [],
    params,
  } = {}
) => {
  const requestKey = buildRequestKey(path, params)

  if (isRateLimited(requestKey) && cacheKey) {
    const cached = getCachedValue(cacheKey)
    if (cached !== null) {
      return cached
    }

    return fallbackValue
  }

  if (inFlightRequests.has(requestKey)) {
    return inFlightRequests.get(requestKey)
  }

  const requestPromise = (async () => {
    try {
      const data = await api.get(path, { timeout, params })
      if (cacheKey) {
        setCachedValue(cacheKey, data)
      }
      return data
    } catch (error) {
      const status = error.status || error.response?.status
      const shouldUseCache = status === 429 || status >= 500 || error.code === 'ERR_NETWORK'

      if (status === 429) {
        setRateLimitCooldown(requestKey, error.response?.headers?.['retry-after'])
      }

      if (cacheKey && shouldUseCache) {
        const cached = getCachedValue(cacheKey)
        if (cached !== null) {
          console.warn(`Using cached response for ${path} due to upstream error (${status || error.code || 'unknown'})`)
          return cached
        }

        return fallbackValue
      }

      throw error
    } finally {
      inFlightRequests.delete(requestKey)
    }
  })()

  inFlightRequests.set(requestKey, requestPromise)
  return requestPromise
}

export const marketAPI = {
  getLatestProducts: ({ limit, category, search } = {}) => {
    const params = {}
    if (limit) params.limit = limit
    if (category) params.category = category
    if (search) params.search = search

    return getWithFallback('/api/products/latest', {
      cacheKey: `products:${JSON.stringify(params)}`,
      timeout: 15000,
      fallbackValue: [],
      params,
    })
  },
  getProductForecast: (productName, days = 7) =>
    getWithFallback(`/api/products/${encodeURIComponent(productName)}/forecast`, {
      cacheKey: `forecast:${productName}:${days}`,
      timeout: 15000,
      fallbackValue: [],
      params: { days },
    }),
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
    api.post('/api/data/update', {}, { timeout: 180000 }), // 3 minutes timeout
}

export default api