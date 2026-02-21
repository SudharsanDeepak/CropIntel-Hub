import { motion } from 'framer-motion'
import { Calendar, TrendingUp, Package, DollarSign, BarChart3, Filter, RefreshCw } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Forecast = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [forecastData, setForecastData] = useState([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  useEffect(() => {
    fetchProducts()
  }, [])
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_URL}/api/products/latest`, {
        timeout: 10000
      })
      const data = response.data || []
      setProducts(data)
      if (data.length > 0) {
        setSelectedProduct(data[0].product)
        fetchForecast(data[0].product)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }
  const fetchForecast = async (productName) => {
    try {
      setForecastLoading(true)
      const response = await axios.get(
        `${API_URL}/api/products/${encodeURIComponent(productName)}/forecast`,
        { params: { days: 7 }, timeout: 5000 }
      )
      const data = response.data || []
      const formattedData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: parseFloat(item.predicted_price.toFixed(2)),
        demand: parseFloat(item.predicted_demand.toFixed(1)),
        fullDate: item.date
      })).reverse() 
      setForecastData(formattedData)
    } catch (error) {
      console.error('Error fetching forecast:', error)
      setForecastData([])
    } finally {
      setForecastLoading(false)
    }
  }
  const handleProductChange = (productName) => {
    setSelectedProduct(productName)
    fetchForecast(productName)
  }
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products
    return products.filter(p => p.category === selectedCategory)
  }, [products, selectedCategory])
  const stats = useMemo(() => {
    if (forecastData.length === 0) return null
    const avgPrice = forecastData.reduce((sum, d) => sum + d.price, 0) / forecastData.length
    const avgDemand = forecastData.reduce((sum, d) => sum + d.demand, 0) / forecastData.length
    const priceChange = ((forecastData[forecastData.length - 1].price - forecastData[0].price) / forecastData[0].price * 100).toFixed(1)
    const demandChange = ((forecastData[forecastData.length - 1].demand - forecastData[0].demand) / forecastData[0].demand * 100).toFixed(1)
    return {
      avgPrice: avgPrice.toFixed(2),
      avgDemand: avgDemand.toFixed(1),
      priceChange,
      demandChange,
      currentPrice: forecastData[forecastData.length - 1].price,
      currentDemand: forecastData[forecastData.length - 1].demand
    }
  }, [forecastData])
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Price' ? `₹${entry.value}/kg` : `${entry.value} units`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">7-Day Forecast</h1>
          <p className="text-gray-600 mt-2">Real-time price and demand trends</p>
        </div>
        <button
          onClick={fetchProducts}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>
      {}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              value={selectedProduct || ''}
              onChange={(e) => handleProductChange(e.target.value)}
              className="input-field"
              disabled={isLoading}
            >
              {filteredProducts.map((product) => (
                <option key={product.product} value={product.product}>
                  {product.product} - ₹{product.price.toFixed(2)}/kg
                </option>
              ))}
            </select>
          </div>
          {}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Category
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory('fruit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'fruit'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Fruits
              </button>
              <button
                onClick={() => setSelectedCategory('vegetable')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
      </div>
      {}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current Price</span>
              <DollarSign className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.currentPrice}/kg</p>
            <p className={`text-sm mt-1 ${parseFloat(stats.priceChange) >= 0 ? 'text-secondary-600' : 'text-tertiary-600'}`}>
              {parseFloat(stats.priceChange) >= 0 ? '↑' : '↓'} {Math.abs(stats.priceChange)}% vs 7 days ago
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current Demand</span>
              <Package className="h-5 w-5 text-secondary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.currentDemand} units</p>
            <p className={`text-sm mt-1 ${parseFloat(stats.demandChange) >= 0 ? 'text-secondary-600' : 'text-tertiary-600'}`}>
              {parseFloat(stats.demandChange) >= 0 ? '↑' : '↓'} {Math.abs(stats.demandChange)}% vs 7 days ago
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">7-Day Avg Price</span>
              <BarChart3 className="h-5 w-5 text-accent-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.avgPrice}/kg</p>
            <p className="text-sm text-gray-500 mt-1">Average over 7 days</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">7-Day Avg Demand</span>
              <TrendingUp className="h-5 w-5 text-tertiary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgDemand} units</p>
            <p className="text-sm text-gray-500 mt-1">Average over 7 days</p>
          </motion.div>
        </div>
      )}
      {}
      {forecastLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading forecast data...</p>
            </div>
          </div>
          <div className="card h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading forecast data...</p>
            </div>
          </div>
        </div>
      ) : forecastData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Price Trend</h2>
                <p className="text-sm text-gray-600 mt-1">7-day price history</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84994F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#84994F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#84994F" 
                  strokeWidth={3}
                  fill="url(#colorPrice)"
                  name="Price"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          {}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Demand Trend</h2>
                <p className="text-sm text-gray-600 mt-1">7-day demand history</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-xl">
                <Package className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="demand" 
                  fill="#FCB53B" 
                  radius={[8, 8, 0, 0]}
                  name="Demand"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Combined Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">Price vs Demand correlation</p>
              </div>
              <div className="p-3 bg-accent-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-accent-700" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="price" 
                  stroke="#84994F" 
                  strokeWidth={3}
                  dot={{ fill: '#84994F', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Price"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="demand" 
                  stroke="#FCB53B" 
                  strokeWidth={3}
                  dot={{ fill: '#FCB53B', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Demand"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      ) : (
        <div className="card h-96 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No forecast data available</p>
            <p className="text-gray-400 text-sm mt-2">Select a product to view forecast</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
export default Forecast