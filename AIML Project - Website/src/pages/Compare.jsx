import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, X, Plus, TrendingUp, TrendingDown, DollarSign, Package, BarChart3, Search, Filter } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { ToastContainer } from '../components/Toast'
import { useToast } from '../hooks/useToast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Compare = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [forecastData, setForecastData] = useState({})
  const [loadingForecasts, setLoadingForecasts] = useState(false)
  const { toasts, removeToast, warning } = useToast()
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
  const fetchForecast = async (productName) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products/${encodeURIComponent(productName)}/forecast`,
        { params: { days: 7 }, timeout: 5000 }
      )
      return response.data || []
    } catch (error) {
      console.error('Error fetching forecast:', error)
      return []
    }
  }
  const addProduct = async (product) => {
    if (selectedProducts.find(p => p.product === product.product)) {
      return 
    }
    if (selectedProducts.length >= 4) {
      warning('You can compare up to 4 products at a time')
      return
    }
    setSelectedProducts([...selectedProducts, product])
    setShowProductSelector(false)
    setLoadingForecasts(true)
    const forecast = await fetchForecast(product.product)
    setForecastData(prev => ({
      ...prev,
      [product.product]: forecast
    }))
    setLoadingForecasts(false)
  }
  const removeProduct = (productName) => {
    setSelectedProducts(selectedProducts.filter(p => p.product !== productName))
    const newForecastData = { ...forecastData }
    delete newForecastData[productName]
    setForecastData(newForecastData)
  }
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.product.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const notSelected = !selectedProducts.find(p => p.product === product.product)
      return matchesSearch && matchesCategory && notSelected
    })
  }, [products, searchTerm, selectedCategory, selectedProducts])
  const comparisonChartData = useMemo(() => {
    if (selectedProducts.length === 0) return []
    const maxDays = 7
    const chartData = []
    for (let i = 0; i < maxDays; i++) {
      const dataPoint = { day: `Day ${i + 1}` }
      selectedProducts.forEach(product => {
        const forecast = forecastData[product.product]
        if (forecast && forecast[i]) {
          dataPoint[`${product.product}_price`] = forecast[i].predicted_price
          dataPoint[`${product.product}_demand`] = forecast[i].predicted_demand
        }
      })
      chartData.push(dataPoint)
    }
    return chartData
  }, [selectedProducts, forecastData])
  const radarChartData = useMemo(() => {
    if (selectedProducts.length === 0) return []
    return selectedProducts.map(product => {
      const forecast = forecastData[product.product] || []
      const avgPrice = forecast.length > 0 
        ? forecast.reduce((sum, f) => sum + f.predicted_price, 0) / forecast.length 
        : product.price
      const avgDemand = forecast.length > 0
        ? forecast.reduce((sum, f) => sum + f.predicted_demand, 0) / forecast.length
        : product.predicted_demand
      return {
        product: product.product,
        price: parseFloat(avgPrice.toFixed(2)),
        demand: parseFloat(avgDemand.toFixed(1)),
        stock: product.stock,
        priceNormalized: (avgPrice / 200) * 100, 
        demandNormalized: (avgDemand / 200) * 100,
        stockNormalized: (product.stock / 200) * 100
      }
    })
  }, [selectedProducts, forecastData])
  const productColors = ['#84994F', '#FCB53B', '#B45253', '#6B7280']
  return (
    <>
      {}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Compare Products</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Side-by-side comparison of multiple products</p>
        </div>
        <button
          onClick={() => setShowProductSelector(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center tap-target"
          disabled={selectedProducts.length >= 4}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm sm:text-base">Add Product {selectedProducts.length > 0 && `(${selectedProducts.length}/4)`}</span>
        </button>
      </div>
      {}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product, index) => (
            <motion.div
              key={product.product}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium"
              style={{ backgroundColor: productColors[index] }}
            >
              <span>{product.product}</span>
              <button
                onClick={() => removeProduct(product.product)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
      {}
      {selectedProducts.length === 0 && (
        <div className="card text-center py-16">
          <GitCompare className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Comparing Products</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Select 2 or more products to see detailed price, demand, and trend comparisons
          </p>
          <button
            onClick={() => setShowProductSelector(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Select Products
          </button>
        </div>
      )}
      {}
      {selectedProducts.length > 0 && (
        <>
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedProducts.map((product, index) => (
              <motion.div
                key={product.product}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card relative"
                style={{ borderTop: `4px solid ${productColors[index]}` }}
              >
                <button
                  onClick={() => removeProduct(product.product)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
                <h3 className="text-lg font-bold text-gray-900 mb-1 pr-8">{product.product}</h3>
                <p className="text-sm text-gray-500 capitalize mb-4">{product.category}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary-600" />
                      <span className="text-sm text-gray-600">Price</span>
                    </div>
                    <span className="font-bold text-gray-900">₹{product.price.toFixed(2)}/kg</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-secondary-600" />
                      <span className="text-sm text-gray-600">Demand</span>
                    </div>
                    <span className="font-bold text-gray-900">{product.predicted_demand.toFixed(1)} units</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-accent-700" />
                      <span className="text-sm text-gray-600">Stock</span>
                    </div>
                    <span className="font-bold text-gray-900">{product.stock} units</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {}
          {selectedProducts.length >= 2 && (
            <>
              {}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Price Comparison</h2>
                  <p className="text-sm text-gray-600 mt-1">7-day price trends</p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`₹${parseFloat(value).toFixed(2)}/kg`, name.replace('_price', '')]}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    {selectedProducts.map((product, index) => (
                      <Line
                        key={product.product}
                        type="monotone"
                        dataKey={`${product.product}_price`}
                        stroke={productColors[index]}
                        strokeWidth={3}
                        dot={{ fill: productColors[index], r: 4 }}
                        name={product.product}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
              {}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Demand Comparison</h2>
                  <p className="text-sm text-gray-600 mt-1">7-day demand trends</p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${parseFloat(value).toFixed(1)} units`, name.replace('_demand', '')]}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    {selectedProducts.map((product, index) => (
                      <Bar
                        key={product.product}
                        dataKey={`${product.product}_demand`}
                        fill={productColors[index]}
                        name={product.product}
                        radius={[8, 8, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
              {}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Overall Comparison</h2>
                  <p className="text-sm text-gray-600 mt-1">Multi-dimensional analysis</p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={[
                    { metric: 'Price', ...Object.fromEntries(radarChartData.map(d => [d.product, d.priceNormalized])) },
                    { metric: 'Demand', ...Object.fromEntries(radarChartData.map(d => [d.product, d.demandNormalized])) },
                    { metric: 'Stock', ...Object.fromEntries(radarChartData.map(d => [d.product, d.stockNormalized])) }
                  ]}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" stroke="#6b7280" style={{ fontSize: '14px', fontWeight: '600' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '12px' }} />
                    {selectedProducts.map((product, index) => (
                      <Radar
                        key={product.product}
                        name={product.product}
                        dataKey={product.product}
                        stroke={productColors[index]}
                        fill={productColors[index]}
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}
        </>
      )}
      {}
      <AnimatePresence>
        {showProductSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProductSelector(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Select Products</h2>
                    <p className="text-primary-100 mt-1">Choose products to compare ({selectedProducts.length}/4 selected)</p>
                  </div>
                  <button
                    onClick={() => setShowProductSelector(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              {}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col gap-3 sm:gap-4">
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
              </div>
              {}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <motion.button
                        key={product.product}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addProduct(product)}
                        className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-primary-600 hover:shadow-md transition-all"
                      >
                        <h3 className="font-bold text-gray-900 mb-1">{product.product}</h3>
                        <p className="text-sm text-gray-500 capitalize mb-3">{product.category}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-bold text-primary-600">₹{product.price.toFixed(2)}/kg</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  )
}
export default Compare