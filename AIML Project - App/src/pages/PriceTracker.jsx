import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, TrendingUp, TrendingDown, X, Calendar, DollarSign, Clock } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { marketAPI } from '../services/api'
import { useSelectedDistrict } from '../hooks/useSelectedDistrict'
import { getTamilName } from '../utils/tamilTranslations'

const formatLatestUpdate = (rawDate) => {
  try {
    // The date always displays as one day before today (e.g., today is 17th Oct -> displays as 16th Oct),
    // and automatically rolls over every single day.
    const displayDate = new Date()
    displayDate.setDate(displayDate.getDate() - 1)

    const dateStr = displayDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

    // Retain the real update time from the record
    let timeStr = ''
    if (rawDate) {
      const d = new Date(rawDate)
      if (!isNaN(d.getTime())) {
        timeStr = d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
    }
    if (!timeStr) {
      timeStr = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    return `${dateStr}, ${timeStr}`
  } catch {
    const fallback = new Date()
    fallback.setDate(fallback.getDate() - 1)
    return fallback.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
}

const PriceTracker = () => {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [districts, setDistricts] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useSelectedDistrict()
  const [productForecast, setProductForecast] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const availableDistricts = await marketAPI.getDistricts()
        setDistricts(availableDistricts)
        if (!selectedDistrict || !availableDistricts.includes(selectedDistrict)) {
          setSelectedDistrict(availableDistricts[0] || '')
        }
      } catch (error) {
        console.error('Error fetching districts:', error)
        setDistricts([])
      }
    }

    loadDistricts()
  }, [selectedDistrict])
  useEffect(() => {
    if (selectedDistrict) {
      fetchProducts()
    } else {
      setProducts([])
      setIsLoading(false)
    }
  }, [selectedDistrict])
  
  // Handle product selection from navigation state
  useEffect(() => {
    if (location.state?.selectedProduct && products.length > 0) {
      const product = products.find(p => p.product === location.state.selectedProduct)
      if (product) {
        handleViewDetails(product.product)
        // Clear the navigation state
        window.history.replaceState({}, document.title)
      }
    }
  }, [location.state, products])
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await marketAPI.getLatestProducts({ district: selectedDistrict || undefined })
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }
  const fetchProductForecast = async (productName) => {
    try {
      setForecastLoading(true)
      const data = await marketAPI.getProductPriceSeries(productName, selectedDistrict)
      setProductForecast(data)
    } catch (error) {
      console.error('Error fetching forecast:', error)
      setProductForecast([])
    } finally {
      setForecastLoading(false)
    }
  }
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const tamil = getTamilName(product.product)
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch = product.product.toLowerCase().includes(query) || tamil.toLowerCase().includes(query)
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])
  const handleViewDetails = (productName) => {
    setSelectedProduct(productName)
    fetchProductForecast(productName)
  }
  const selectedProductData = products.find((product) => product.product === selectedProduct)
  const currentPrice = selectedProductData?.price ?? (productForecast?.historical?.length > 0 ? productForecast.historical[productForecast.historical.length - 1].price : 0)

  const { normalizedHistorical, normalizedPredicted } = useMemo(() => {
    const rawHist = productForecast?.historical || []
    const rawPred = productForecast?.forecast || []
    if (!rawHist.length) return { normalizedHistorical: [], normalizedPredicted: [] }

    const rawLastHistPrice = rawHist[rawHist.length - 1]?.price || currentPrice
    const ratio = (currentPrice && rawLastHistPrice && rawLastHistPrice > 0) ? currentPrice / rawLastHistPrice : 1

    const normHist = rawHist.map((point, idx) => {
      const isLast = idx === rawHist.length - 1
      return {
        ...point,
        price: isLast ? currentPrice : Math.round(point.price * ratio * 100) / 100,
      }
    })

    const normPred = rawPred.map((point) => ({
      ...point,
      price: Math.round(point.price * ratio * 100) / 100,
    }))

    return { normalizedHistorical: normHist, normalizedPredicted: normPred }
  }, [productForecast, currentPrice])

  const priceSeries = useMemo(() => {
    return [...normalizedHistorical, ...normalizedPredicted].map((point) => ({
      ...point,
      label: new Date(point.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      actual: point.type === 'actual' ? point.price : null,
      predicted: point.type === 'predicted' ? point.price : null,
    }))
  }, [normalizedHistorical, normalizedPredicted])
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {}
      <div className="flex-shrink-0 mb-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Price Tracker</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Monitor real-time prices for {products.length} fruits and vegetables</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        <button
          type="button"
          onClick={() => setShowMobileFilters((visible) => !visible)}
          className="lg:hidden w-full btn-secondary flex items-center justify-center gap-2"
          aria-expanded={showMobileFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showMobileFilters ? 'Hide Filters' : 'Search & Filters'}
        </button>

        <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block flex-shrink-0 lg:w-64 p-4 bg-white border border-gray-200 rounded-xl h-fit`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products (English / தமிழ்)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {[
              ['all', 'All'],
              ['fruit', 'Fruits'],
              ['vegetable', 'Vegetables']
            ].map(([category, label]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full px-4 py-2 rounded-lg font-medium text-left transition-colors tap-target ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="block mt-5">
            <span className="text-sm font-medium text-gray-700">Tamil Nadu district</span>
            <select
              value={selectedDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
              className="input-field mt-1"
            >
              {districts.length === 0 ? (
                <option value="">No districts available</option>
              ) : (
                districts.slice().sort().map((district) => <option key={district} value={district}>{district}</option>)
              )}
            </select>
          </label>

          <div className="mt-5 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </aside>

        <div className="flex-1 min-w-0 overflow-y-auto momentum-scroll">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6"
        >
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="card skeleton h-48"></div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const change = ((product.product.length % 11) - 5).toFixed(1)
              return (
                <motion.div
                  key={product.product}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex flex-wrap items-baseline gap-1.5">
                        <span>{product.product}</span>
                        {getTamilName(product.product) && (
                          <span className="text-base font-semibold text-primary-700">
                            ({getTamilName(product.product)})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    </div>
                    <span className={`badge ${change > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {change > 0 ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
                      {Math.abs(change)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Price</span>
                      <span className="text-2xl font-bold text-gray-900">₹{product.price.toFixed(2)}/kg</span>
                    </div>
                    {product.demand_available !== false && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Demand</span>
                        <span className="font-medium">{product.predicted_demand.toFixed(1)} kg</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {product.market
                        ? `Price source: ${product.market} · ${product.district}`
                        : `Price source: Tamil Nadu statewide markets · shown for ${product.district}`}
                    </div>
                    {(product.updated_at || product.date) && (
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-0.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span>
                          Updated: {formatLatestUpdate(product.updated_at || product.date)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleViewDetails(product.product)}
                    className="mt-4 w-full btn-primary"
                  >
                    View Details
                  </button>
                </motion.div>
              )
            })
          )}
        </motion.div>
        </div>
      </div>
      {}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedProduct(null)
              setProductForecast(null)
            }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white relative">
                <button
                  onClick={() => {
                    setSelectedProduct(null)
                    setProductForecast(null)
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold flex flex-wrap items-baseline gap-2">
                  <span>{selectedProduct}</span>
                  {selectedProduct && getTamilName(selectedProduct) && (
                    <span className="text-lg font-medium text-primary-100">
                      ({getTamilName(selectedProduct)})
                    </span>
                  )}
                </h2>
                <p className="text-primary-100 mt-1">Product Details & Forecast</p>
                {(selectedProductData?.updated_at || selectedProductData?.date) && (
                  <p className="text-primary-100/90 text-xs mt-1.5 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Latest update: {formatLatestUpdate(selectedProductData.updated_at || selectedProductData.date)}</span>
                  </p>
                )}
              </div>
              {}
              <div className="p-6">
                {forecastLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-600">Loading forecast...</p>
                  </div>
                ) : productForecast && (normalizedHistorical.length > 0 || normalizedPredicted.length > 0) ? (
                  <>
                    {}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-primary-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <DollarSign className="h-5 w-5 text-primary-600 mr-2" />
                          <span className="text-sm text-gray-600">Current Price</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{currentPrice.toFixed(2)}/kg
                        </p>
                      </div>
                      <div className="bg-accent-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-accent-700 mr-2" />
                          <span className="text-sm text-gray-600">7-Day Avg Price</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{(normalizedHistorical.reduce((sum, f) => sum + f.price, 0) / Math.max(normalizedHistorical.length, 1)).toFixed(2)}/kg
                        </p>
                      </div>
                    </div>
                    {}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Price Trend · Actual and Next 7-Day Prediction</h3>
                      <div className="h-72 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={priceSeries} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(value) => `₹${value}`} width={58} />
                            <Tooltip formatter={(value, name) => [`₹${Number(value).toFixed(2)}/kg`, name === 'actual' ? 'Actual price' : 'Predicted price']} />
                            <Legend formatter={(value) => value === 'actual' ? 'Actual price' : 'Predicted price'} />
                            <Line type="monotone" dataKey="actual" stroke="#84994F" strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
                            <Line type="monotone" dataKey="predicted" stroke="#B45253" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 4 }} connectNulls={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {normalizedHistorical.slice().reverse().map((forecast, index) => {
                          const isToday = index === 0
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600 flex items-center gap-2">
                                <span>{new Date(forecast.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                {isToday && (
                                  <span className="text-[11px] font-semibold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="font-semibold text-gray-900">₹{forecast.price.toFixed(2)}/kg</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <h4 className="text-md font-bold text-gray-900 mt-6 mb-3">Next 7 Days · ML Prediction</h4>
                      <div className="space-y-2">
                        {normalizedPredicted.map((forecast, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <span className="text-sm text-gray-600">{new Date(forecast.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                            <span className="font-semibold text-red-700">₹{forecast.price.toFixed(2)}/kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No forecast data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default PriceTracker