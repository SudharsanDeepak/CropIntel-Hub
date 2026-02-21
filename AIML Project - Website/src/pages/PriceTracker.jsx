import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, X, Calendar, Package, DollarSign, BarChart3 } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const PriceTracker = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [productForecast, setProductForecast] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  useEffect(() => {
    fetchProducts()
  }, [])
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_URL}/api/products/latest`, {
        timeout: 10000 
      })
      setProducts(response.data || [])
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
      const response = await axios.get(
        `${API_URL}/api/products/${encodeURIComponent(productName)}/forecast`,
        { params: { days: 7 }, timeout: 5000 }
      )
      setProductForecast(response.data || [])
    } catch (error) {
      console.error('Error fetching forecast:', error)
      setProductForecast([])
    } finally {
      setForecastLoading(false)
    }
  }
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.product.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])
  const handleViewDetails = (productName) => {
    setSelectedProduct(productName)
    fetchProductForecast(productName)
  }
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {}
      <div className="flex-shrink-0 mb-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Price Tracker</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Monitor real-time prices for {products.length} fruits and vegetables</p>
        </div>
        {}
        <div className="flex flex-col gap-4">
          {}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          {}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 tap-target ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('fruit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 tap-target ${
                selectedCategory === 'fruit'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fruits
            </button>
            <button
              onClick={() => setSelectedCategory('vegetable')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 tap-target ${
                selectedCategory === 'vegetable'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Vegetables
            </button>
          </div>
        </div>
        {}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
      {}
      <div className="flex-1 overflow-y-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 momentum-scroll">
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
              const change = ((Math.random() - 0.5) * 10).toFixed(1)
              return (
                <motion.div
                  key={product.product}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{product.product}</h3>
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
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Demand</span>
                      <span className="font-medium">{product.predicted_demand.toFixed(1)} units</span>
                    </div>
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
                <h2 className="text-2xl font-bold">{selectedProduct}</h2>
                <p className="text-primary-100 mt-1">Product Details & Forecast</p>
              </div>
              {}
              <div className="p-6">
                {forecastLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-600">Loading forecast...</p>
                  </div>
                ) : productForecast && productForecast.length > 0 ? (
                  <>
                    {}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-primary-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <DollarSign className="h-5 w-5 text-primary-600 mr-2" />
                          <span className="text-sm text-gray-600">Current Price</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{productForecast[0]?.predicted_price.toFixed(2)}/kg</p>
                      </div>
                      <div className="bg-secondary-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <BarChart3 className="h-5 w-5 text-secondary-600 mr-2" />
                          <span className="text-sm text-gray-600">Current Demand</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{productForecast[0]?.predicted_demand.toFixed(1)} units</p>
                      </div>
                      <div className="bg-accent-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-accent-700 mr-2" />
                          <span className="text-sm text-gray-600">7-Day Avg Price</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{(productForecast.reduce((sum, f) => sum + f.predicted_price, 0) / productForecast.length).toFixed(2)}/kg
                        </p>
                      </div>
                      <div className="bg-tertiary-50 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <Package className="h-5 w-5 text-tertiary-600 mr-2" />
                          <span className="text-sm text-gray-600">Avg Demand</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {(productForecast.reduce((sum, f) => sum + f.predicted_demand, 0) / productForecast.length).toFixed(1)} units
                        </p>
                      </div>
                    </div>
                    {}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">7-Day Price History</h3>
                      <div className="space-y-2">
                        {productForecast.map((forecast, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">
                              {new Date(forecast.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-gray-900">₹{forecast.predicted_price.toFixed(2)}/kg</span>
                              <span className="text-sm text-gray-600">{forecast.predicted_demand.toFixed(1)} units</span>
                            </div>
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