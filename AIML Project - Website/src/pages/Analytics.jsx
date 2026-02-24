import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, Package, DollarSign, Cloud, CloudRain, Sun, Wind, Droplets, ThermometerSun, Newspaper, AlertTriangle, TrendingDown, Calendar, MapPin, Search, RefreshCw, Eye, Gauge, Sunrise, Sunset, CloudDrizzle, Navigation } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const WEATHER_API_KEY = '4d8fb5b93d4af21d66a2948710284366' 
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5'

const Analytics = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [weatherData, setWeatherData] = useState(null)
  const [marketNews, setMarketNews] = useState([])
  const [location, setLocation] = useState('London')
  const [locationInput, setLocationInput] = useState('')
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [activeTab, setActiveTab] = useState('bestDeals')
  const [selectedWeatherProduct, setSelectedWeatherProduct] = useState(null)
  const [hourlyForecast, setHourlyForecast] = useState([])
  const [showHourlyForecast, setShowHourlyForecast] = useState(false)
  
  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('weatherLocation')
    if (savedLocation) {
      setLocation(savedLocation)
    } else {
      detectUserLocation()
    }
  }, [])
  
  useEffect(() => {
    fetchProducts()
    fetchMarketNews()
  }, [])
  
  useEffect(() => {
    if (location) {
      fetchWeatherData(location)
    }
  }, [location])
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_URL}/api/products/latest`, {
        timeout: 10000
      })
      const data = response.data || []
      setProducts(data)
      // Set first product as default for weather impact
      if (data.length > 0 && !selectedWeatherProduct) {
        setSelectedWeatherProduct(data[0].product)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }
  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await axios.get(
              `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
            )
            if (response.data && response.data.name) {
              setLocation(response.data.name)
            }
          } catch (error) {
            console.log('Could not detect location, using default')
          }
        },
        (error) => {
          console.log('Geolocation not available, using default location')
        }
      )
    }
  }
  const fetchWeatherData = async (cityName) => {
    try {
      setWeatherLoading(true)
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${WEATHER_API_KEY}`
      )
      
      let weatherUrl, forecastUrl, airQualityUrl
      if (geoResponse.data && geoResponse.data.length > 0) {
        const { lat, lon, name, country } = geoResponse.data[0]
        weatherUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        forecastUrl = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        airQualityUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
        const locationName = `${name}, ${country}`
        setLocation(locationName)
        // Save to localStorage
        localStorage.setItem('weatherLocation', locationName)
      } else {
        weatherUrl = `${WEATHER_API_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${WEATHER_API_KEY}&units=metric`
        forecastUrl = `${WEATHER_API_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${WEATHER_API_KEY}&units=metric`
        // Save to localStorage
        localStorage.setItem('weatherLocation', cityName)
      }
      
      const [currentWeather, forecast, airQuality] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl),
        airQualityUrl ? axios.get(airQualityUrl).catch(() => null) : Promise.resolve(null)
      ])
      
      // Process hourly forecast (next 24 hours)
      const hourlyData = forecast.data.list.slice(0, 8).map(item => {
        const date = new Date(item.dt * 1000)
        return {
          time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          icon: item.weather[0].icon,
          rainfall: item.rain?.['3h'] || 0
        }
      })
      setHourlyForecast(hourlyData)
      
      const dailyForecast = []
      const forecastByDay = {}
      forecast.data.list.forEach(item => {
        const date = new Date(item.dt * 1000)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
        if (!forecastByDay[dayName]) {
          forecastByDay[dayName] = {
            temps: [],
            humidity: [],
            rainfall: 0,
            conditions: []
          }
        }
        forecastByDay[dayName].temps.push(item.main.temp)
        forecastByDay[dayName].humidity.push(item.main.humidity)
        forecastByDay[dayName].rainfall += (item.rain?.['3h'] || 0)
        forecastByDay[dayName].conditions.push(item.weather[0].main)
      })
      Object.keys(forecastByDay).slice(0, 7).forEach(day => {
        const data = forecastByDay[day]
        dailyForecast.push({
          day,
          temp: Math.round(data.temps.reduce((a, b) => a + b, 0) / data.temps.length),
          humidity: Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length),
          rainfall: Math.round(data.rainfall),
          condition: data.conditions[0]
        })
      })
      
      const alerts = []
      const heavyRainDays = dailyForecast.filter(d => d.rainfall > 20)
      if (heavyRainDays.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Heavy Rainfall Expected',
          description: `Moderate to heavy rainfall expected on ${heavyRainDays.map(d => d.day).join(', ')}. Prices may increase for leafy vegetables.`,
          impact: 'high',
          affectedProducts: ['Spinach', 'Lettuce', 'Cabbage', 'Cauliflower', 'Coriander']
        })
      }
      const hotDays = dailyForecast.filter(d => d.temp > 35)
      if (hotDays.length > 0) {
        alerts.push({
          type: 'info',
          title: 'High Temperature Alert',
          description: `Temperature expected to exceed 35°C on ${hotDays.map(d => d.day).join(', ')}. Good conditions for fruit ripening.`,
          impact: 'medium',
          affectedProducts: ['Mango', 'Banana', 'Papaya', 'Watermelon']
        })
      }
      const coldDays = dailyForecast.filter(d => d.temp < 15)
      if (coldDays.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Cold Weather Expected',
          description: `Temperature may drop below 15°C. Winter vegetables will be in good supply.`,
          impact: 'low',
          affectedProducts: ['Carrot', 'Radish', 'Turnip', 'Beetroot']
        })
      }
      
      // Air quality index interpretation
      const getAQILevel = (aqi) => {
        if (aqi === 1) return { level: 'Good', color: 'green' }
        if (aqi === 2) return { level: 'Fair', color: 'yellow' }
        if (aqi === 3) return { level: 'Moderate', color: 'orange' }
        if (aqi === 4) return { level: 'Poor', color: 'red' }
        return { level: 'Very Poor', color: 'purple' }
      }
      
      const airQualityData = airQuality?.data?.list?.[0]
      const aqiInfo = airQualityData ? getAQILevel(airQualityData.main.aqi) : null
      
      setWeatherData({
        current: {
          temp: Math.round(currentWeather.data.main.temp),
          feelsLike: Math.round(currentWeather.data.main.feels_like),
          humidity: currentWeather.data.main.humidity,
          condition: currentWeather.data.weather[0].main,
          description: currentWeather.data.weather[0].description,
          windSpeed: Math.round(currentWeather.data.wind.speed * 3.6), 
          windDirection: currentWeather.data.wind.deg,
          pressure: currentWeather.data.main.pressure,
          visibility: Math.round(currentWeather.data.visibility / 1000), // km
          cloudiness: currentWeather.data.clouds.all,
          sunrise: new Date(currentWeather.data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          sunset: new Date(currentWeather.data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          location: `${currentWeather.data.name}, ${currentWeather.data.sys.country}`,
          icon: currentWeather.data.weather[0].icon,
          airQuality: aqiInfo
        },
        forecast: dailyForecast,
        alerts: alerts.length > 0 ? alerts : [{
          type: 'info',
          title: 'Normal Weather Conditions',
          description: 'Weather conditions are stable. No significant impact on market prices expected.',
          impact: 'low',
          affectedProducts: []
        }]
      })
    } catch (error) {
      console.error('Error fetching weather data:', error)
      fetchSimulatedWeatherData()
    } finally {
      setWeatherLoading(false)
    }
  }
  const fetchSimulatedWeatherData = () => {
    const forecast = [
      { day: 'Mon', temp: 28, humidity: 65, rainfall: 5, condition: 'Partly Cloudy' },
      { day: 'Tue', temp: 30, humidity: 70, rainfall: 15, condition: 'Light Rain' },
      { day: 'Wed', temp: 27, humidity: 75, rainfall: 25, condition: 'Moderate Rain' },
      { day: 'Thu', temp: 26, humidity: 80, rainfall: 30, condition: 'Heavy Rain' },
      { day: 'Fri', temp: 29, humidity: 68, rainfall: 10, condition: 'Cloudy' },
      { day: 'Sat', temp: 31, humidity: 60, rainfall: 0, condition: 'Sunny' },
      { day: 'Sun', temp: 32, humidity: 55, rainfall: 0, condition: 'Clear' }
    ]
    setWeatherData({
      current: {
        temp: 28,
        humidity: 65,
        condition: 'Partly Cloudy',
        windSpeed: 12,
        location: `${location}, India`
      },
      forecast,
      alerts: [
        {
          type: 'warning',
          title: 'Heavy Rainfall Expected',
          description: 'Moderate to heavy rainfall expected on Wed-Thu. Prices may increase for leafy vegetables.',
          impact: 'high',
          affectedProducts: ['Spinach', 'Lettuce', 'Cabbage', 'Cauliflower']
        }
      ]
    })
  }
  const handleLocationSearch = async (value) => {
    setLocationInput(value)
    if (value.length < 2) {
      setLocationSuggestions([])
      return
    }
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${value},IN&limit=10&appid=${WEATHER_API_KEY}`
      )
      
      if (response.data && response.data.length > 0) {
        const suggestions = response.data.map(item => ({
          name: item.name,
          country: item.country,
          state: item.state || '',
          lat: item.lat,
          lon: item.lon,
          display: `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`
        }))
        
        const exactMatch = suggestions.find(s => 
          s.name.toLowerCase() === value.toLowerCase()
        )
        
        if (exactMatch) {
          setLocationSuggestions([exactMatch, ...suggestions.filter(s => s !== exactMatch)])
        } else {
          setLocationSuggestions(suggestions)
        }
      } else {
        setLocationSuggestions([{
          name: value,
          country: 'IN',
          state: 'Location not found',
          display: `${value} (Not found - showing nearest match)`,
          notFound: true
        }])
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setLocationSuggestions([])
    }
  }
  const selectLocation = (suggestion) => {
    const displayName = typeof suggestion === 'string' ? suggestion : suggestion.display
    const searchName = typeof suggestion === 'string' ? suggestion : suggestion.name
    setLocation(displayName)
    setLocationInput('')
    setShowLocationSearch(false)
    setLocationSuggestions([])
    fetchWeatherData(searchName)
  }
  const fetchMarketNews = () => {
    const news = [
      {
        id: 1,
        title: 'Tomato Prices Surge 40% Due to Unseasonal Rains',
        source: 'Agricultural Market News',
        time: '2 hours ago',
        category: 'Price Alert',
        impact: 'high',
        summary: 'Heavy rainfall in major tomato-producing regions has led to crop damage, causing prices to spike across major markets.'
      },
      {
        id: 2,
        title: 'Mango Season Peaks: Prices Expected to Drop',
        source: 'Fruit Market Report',
        time: '5 hours ago',
        category: 'Market Trend',
        impact: 'medium',
        summary: 'With peak mango season arriving, supply is increasing leading to expected price reductions of 15-20% in coming weeks.'
      },
      {
        id: 3,
        title: 'Government Announces Minimum Support Price for Onions',
        source: 'Ministry of Agriculture',
        time: '1 day ago',
        category: 'Policy Update',
        impact: 'high',
        summary: 'New MSP announced at ₹2,410 per quintal to support farmers and stabilize market prices during the upcoming season.'
      },
      {
        id: 4,
        title: 'Organic Vegetable Demand Rises 35% in Urban Markets',
        source: 'Market Research India',
        time: '2 days ago',
        category: 'Market Insight',
        impact: 'low',
        summary: 'Consumer preference shifting towards organic produce, creating new opportunities for organic farmers and retailers.'
      },
      {
        id: 5,
        title: 'Cold Storage Capacity Expansion in Punjab',
        source: 'Infrastructure News',
        time: '3 days ago',
        category: 'Infrastructure',
        impact: 'medium',
        summary: 'New cold storage facilities with 50,000 MT capacity to help reduce post-harvest losses and stabilize prices.'
      }
    ]
    setMarketNews(news)
  }
  const weatherImpactData = useMemo(() => {
    if (!weatherData || products.length === 0 || !selectedWeatherProduct) return []
    
    // Find the selected product's current price
    const selectedProduct = products.find(p => p.product === selectedWeatherProduct)
    const basePrice = selectedProduct ? selectedProduct.price : 50
    
    return weatherData.forecast.map((day, index) => {
      // Rainfall impact: Heavy rain increases prices (supply disruption)
      const rainfallImpact = day.rainfall > 20 ? 1.15 : day.rainfall > 10 ? 1.08 : 1.0
      // Temperature impact: Extreme heat can reduce prices (faster spoilage)
      const tempImpact = day.temp > 30 ? 0.95 : 1.0
      
      return {
        day: day.day,
        basePrice: parseFloat(basePrice.toFixed(2)),
        predictedPrice: parseFloat((basePrice * rainfallImpact * tempImpact).toFixed(2)),
        rainfall: day.rainfall,
        temp: day.temp,
        impact: rainfallImpact > 1.1 ? 'High' : rainfallImpact > 1.05 ? 'Medium' : 'Low'
      }
    })
  }, [weatherData, products, selectedWeatherProduct])
  const marketStats = useMemo(() => {
    if (products.length === 0) return null
    const totalVolume = products.reduce((sum, p) => sum + p.predicted_demand, 0)
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length
    const fruits = products.filter(p => p.category === 'fruit')
    const vegetables = products.filter(p => p.category === 'vegetable')
    return {
      totalVolume: totalVolume.toFixed(1),
      avgPrice: avgPrice.toFixed(2),
      totalProducts: products.length,
      fruits: fruits.length,
      vegetables: vegetables.length,
      growthRate: '+15.3%' 
    }
  }, [products])
  const trendingProducts = useMemo(() => {
    if (products.length === 0) return { bestDeals: [], priceDrops: [], highDemand: [], seasonal: [] }
    const productsWithTrends = products.map(p => ({
      ...p,
      priceChange: ((Math.random() - 0.5) * 20).toFixed(1), 
      demandTrend: ((Math.random() - 0.3) * 30).toFixed(1), 
      savings: (p.price * (Math.random() * 0.15)).toFixed(2) 
    }))
    const bestDeals = [...productsWithTrends]
      .sort((a, b) => a.price - b.price)
      .slice(0, 6)
    const priceDrops = productsWithTrends
      .filter(p => parseFloat(p.priceChange) < -5)
      .sort((a, b) => parseFloat(a.priceChange) - parseFloat(b.priceChange))
      .slice(0, 6)
    const highDemand = [...productsWithTrends]
      .sort((a, b) => b.predicted_demand - a.predicted_demand)
      .slice(0, 6)
    const seasonal = productsWithTrends
      .filter(p => ['Mango', 'Watermelon', 'Cucumber', 'Tomato', 'Spinach', 'Lettuce'].includes(p.product))
      .slice(0, 6)
    return { bestDeals, priceDrops, highDemand, seasonal }
  }, [products])
  
  const handleViewDetails = (product) => {
    // Navigate to Price Tracker with the selected product
    navigate('/tracker', { state: { selectedProduct: product.product } })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Market Analytics</h1>
        <p className="text-gray-600 mt-2">Deep insights into market trends, weather impact, and real-time news</p>
      </div>
      {}
      {marketStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Volume</span>
              <BarChart3 className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{marketStats.totalVolume}</p>
            <p className="text-sm text-secondary-600 mt-1">units traded</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <TrendingUp className="h-5 w-5 text-secondary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{marketStats.growthRate}</p>
            <p className="text-sm text-secondary-600 mt-1">vs last month</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Products</span>
              <Package className="h-5 w-5 text-accent-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{marketStats.totalProducts}</p>
            <p className="text-sm text-gray-500 mt-1">{marketStats.fruits} fruits, {marketStats.vegetables} vegetables</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Price</span>
              <DollarSign className="h-5 w-5 text-tertiary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{marketStats.avgPrice}/kg</p>
            <p className="text-sm text-tertiary-600 mt-1">↓ 3.1% this week</p>
          </motion.div>
        </div>
      )}
      {}
      {weatherData && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl shadow-2xl"
          >
            {}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -ml-32 -mb-32"></div>
              </div>
            </div>
            {}
            {weatherLoading && (
              <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium">Fetching weather data...</p>
                </div>
              </div>
            )}
            {}
            <div className="relative z-10 p-6 sm:p-8">
              {}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-white/90" />
                    {showLocationSearch ? (
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => handleLocationSearch(e.target.value)}
                          placeholder="Search any city worldwide..."
                          className="w-full px-4 py-2.5 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg font-medium"
                          autoFocus
                          onBlur={() => {
                            setTimeout(() => {
                              if (locationSuggestions.length === 0) {
                                setShowLocationSearch(false)
                              }
                            }, 200)
                          }}
                        />
                        {locationSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-20 max-h-64 overflow-y-auto">
                            {locationSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => selectLocation(suggestion)}
                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 ${
                                  suggestion.notFound ? 'bg-yellow-50' : ''
                                }`}
                                disabled={suggestion.notFound}
                              >
                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                  {suggestion.name}
                                  {index === 0 && !suggestion.notFound && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      Best Match
                                    </span>
                                  )}
                                  {suggestion.notFound && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                      Not Found
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {suggestion.notFound ? (
                                    'Try searching for a nearby city or district'
                                  ) : (
                                    <>
                                      {suggestion.state && `${suggestion.state}, `}{suggestion.country}
                                    </>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLocationSearch(true)}
                        className="text-2xl font-bold text-white hover:text-white/90 transition-colors flex items-center gap-2 group"
                      >
                        {weatherData?.current.location || location}
                        <Search className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="text-sm font-medium">Real-time Weather Conditions</span>
                  </div>
                </div>
                <button
                  onClick={() => fetchWeatherData(location)}
                  disabled={weatherLoading}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl tap-target"
                  title="Refresh weather"
                >
                  <RefreshCw className={`h-5 w-5 text-white ${weatherLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center shadow-xl">
                      <ThermometerSun className="h-14 w-14 sm:h-16 sm:w-16 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Sun className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-6xl sm:text-7xl font-bold text-white mb-2">
                      {weatherData?.current.temp}°
                    </div>
                    <div className="text-lg sm:text-xl text-white/90 font-medium capitalize">
                      {weatherData?.current.description || weatherData?.current.condition}
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                      Feels like {weatherData?.current.feelsLike}°C
                    </div>
                  </div>
                </div>
                {}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-5 w-5 text-white/80" />
                      <span className="text-sm text-white/70 font-medium">Humidity</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {weatherData?.current.humidity}%
                    </div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="h-5 w-5 text-white/80" />
                      <span className="text-sm text-white/70 font-medium">Wind Speed</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {weatherData?.current.windSpeed}
                    </div>
                    <div className="text-sm text-white/70 mt-1">km/h</div>
                  </div>
                </div>
              </div>
              
              {}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-4 w-4 text-white/70" />
                    <span className="text-xs text-white/60 font-medium">Visibility</span>
                  </div>
                  <div className="text-xl font-bold text-white">{weatherData?.current.visibility} km</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-4 w-4 text-white/70" />
                    <span className="text-xs text-white/60 font-medium">Pressure</span>
                  </div>
                  <div className="text-xl font-bold text-white">{weatherData?.current.pressure} hPa</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Sunrise className="h-4 w-4 text-white/70" />
                    <span className="text-xs text-white/60 font-medium">Sunrise</span>
                  </div>
                  <div className="text-lg font-bold text-white">{weatherData?.current.sunrise}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Sunset className="h-4 w-4 text-white/70" />
                    <span className="text-xs text-white/60 font-medium">Sunset</span>
                  </div>
                  <div className="text-lg font-bold text-white">{weatherData?.current.sunset}</div>
                </div>
              </div>
              
              {}
              {weatherData?.current.airQuality && (
                <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-white/80" />
                      <span className="text-sm text-white/70 font-medium">Air Quality</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      weatherData.current.airQuality.color === 'green' ? 'bg-green-500 text-white' :
                      weatherData.current.airQuality.color === 'yellow' ? 'bg-yellow-500 text-white' :
                      weatherData.current.airQuality.color === 'orange' ? 'bg-orange-500 text-white' :
                      weatherData.current.airQuality.color === 'red' ? 'bg-red-500 text-white' :
                      'bg-purple-500 text-white'
                    }`}>
                      {weatherData.current.airQuality.level}
                    </span>
                  </div>
                </div>
              )}
              
              {}
              {hourlyForecast.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowHourlyForecast(!showHourlyForecast)}
                    className="w-full flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md hover:bg-white/15 transition-all"
                  >
                    <span className="text-white font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      24-Hour Forecast
                    </span>
                    <motion.div
                      animate={{ rotate: showHourlyForecast ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TrendingDown className="h-5 w-5 text-white" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {showHourlyForecast && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 grid grid-cols-4 md:grid-cols-8 gap-2">
                          {hourlyForecast.map((hour, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center">
                              <div className="text-xs text-white/70 mb-1">{hour.time}</div>
                              <div className="text-2xl mb-1">
                                {hour.condition === 'Clear' ? '☀️' :
                                 hour.condition === 'Clouds' ? '☁️' :
                                 hour.condition === 'Rain' ? '🌧️' :
                                 hour.condition === 'Snow' ? '❄️' : '🌤️'}
                              </div>
                              <div className="text-lg font-bold text-white">{hour.temp}°</div>
                              {hour.rainfall > 0 && (
                                <div className="text-xs text-blue-200 mt-1">
                                  {hour.rainfall}mm
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
          {}
          <div className="grid grid-cols-1 gap-4">
            {weatherData.alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-2xl shadow-lg ${
                  alert.impact === 'high' 
                    ? 'bg-gradient-to-r from-red-50 to-red-100' 
                    : alert.impact === 'medium'
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100'
                }`}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    {}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                      alert.impact === 'high' 
                        ? 'bg-red-500' 
                        : alert.impact === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}>
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    {}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0 ${
                          alert.impact === 'high' 
                            ? 'bg-red-500 text-white' 
                            : alert.impact === 'medium'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-blue-500 text-white'
                        }`}>
                          {alert.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">
                        {alert.description}
                      </p>
                      {alert.affectedProducts && alert.affectedProducts.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                            Affected Products
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {alert.affectedProducts.map((product, i) => (
                              <span 
                                key={i} 
                                className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-800 shadow-sm border border-gray-200"
                              >
                                {product}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Weather Impact on Prices</h2>
                  <p className="text-sm text-gray-600 mt-1">7-day price predictions based on weather forecast</p>
                </div>
                {/* Product Selector */}
                <div className="min-w-[250px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Product
                  </label>
                  <select
                    value={selectedWeatherProduct || ''}
                    onChange={(e) => setSelectedWeatherProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    disabled={isLoading || products.length === 0}
                  >
                    {products.map((product) => (
                      <option key={product.product} value={product.product}>
                        {product.product} - ₹{product.price.toFixed(2)}/kg
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Price Forecast</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={weatherImpactData}>
                    <defs>
                      <linearGradient id="colorPricePrediction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84994F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#84994F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `₹${value}`}
                      tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      formatter={(value) => [`₹${value}/kg`, 'Predicted Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predictedPrice" 
                      stroke="#84994F" 
                      strokeWidth={3}
                      fill="url(#colorPricePrediction)"
                      dot={{ fill: '#84994F', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Weather Conditions</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={weatherImpactData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#3b82f6" 
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fill: '#3b82f6' } }}
                      tick={{ fill: '#3b82f6' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#FCB53B" 
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', style: { fill: '#FCB53B' } }}
                      tick={{ fill: '#FCB53B' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      formatter={(value, name) => {
                        if (name === 'rainfall') return [`${value}mm`, 'Rainfall']
                        if (name === 'temp') return [`${value}°C`, 'Temperature']
                        return [value, name]
                      }}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="rainfall" 
                      fill="#3b82f6" 
                      name="rainfall"
                      radius={[8, 8, 0, 0]}
                      opacity={0.8}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#FCB53B" 
                      strokeWidth={3}
                      dot={{ fill: '#FCB53B', r: 5, strokeWidth: 2, stroke: '#fff' }}
                      name="temp"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            {}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Weather Impact Summary</h3>
                {selectedWeatherProduct && (
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {selectedWeatherProduct}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weatherImpactData.slice(0, 3).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">{day.day}</p>
                      <p className="font-bold text-gray-900">₹{day.predictedPrice}/kg</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      day.impact === 'High' 
                        ? 'bg-red-100 text-red-700' 
                        : day.impact === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {day.impact}
                    </span>
                  </div>
                ))}
              </div>
              {/* Info Box */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Cloud className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <p className="font-semibold mb-1">How it works:</p>
                    <ul className="space-y-0.5 text-blue-800">
                      <li>• Heavy rainfall (&gt;20mm): +15% price increase (supply disruption)</li>
                      <li>• Moderate rainfall (&gt;10mm): +8% price increase</li>
                      <li>• High temperature (&gt;30°C): -5% price decrease (faster spoilage)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Insights</h2>
          <p className="text-gray-600">Discover the best deals, trending products, and seasonal picks</p>
        </div>
        {}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {[
            { id: 'bestDeals', label: 'Best Deals', icon: DollarSign },
            { id: 'priceDrops', label: 'Price Drops', icon: TrendingDown },
            { id: 'highDemand', label: 'High Demand', icon: TrendingUp },
            { id: 'seasonal', label: 'Seasonal Picks', icon: Sun }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeTab === 'bestDeals' ? trendingProducts.bestDeals :
            activeTab === 'priceDrops' ? trendingProducts.priceDrops :
            activeTab === 'highDemand' ? trendingProducts.highDemand :
            trendingProducts.seasonal).map((product, index) => (
            <motion.div
              key={product.product}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
            >
              {}
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                activeTab === 'bestDeals' ? 'bg-secondary-500' :
                activeTab === 'priceDrops' ? 'bg-green-500' :
                activeTab === 'highDemand' ? 'bg-orange-500' :
                'bg-purple-500'
              }`}>
                {activeTab === 'bestDeals' ? 'Best Deal' :
                 activeTab === 'priceDrops' ? `${product.priceChange}%` :
                 activeTab === 'highDemand' ? 'Trending' :
                 'Seasonal'}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{product.product}</h3>
                <p className="text-sm text-gray-500 capitalize">{product.category}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-600">₹{product.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">/kg</span>
                </div>
                {}
                {activeTab === 'bestDeals' && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">You Save</span>
                    <span className="font-bold text-green-600">₹{product.savings}</span>
                  </div>
                )}
                {activeTab === 'priceDrops' && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Price Drop</span>
                    <span className="font-bold text-green-600">{product.priceChange}%</span>
                  </div>
                )}
                {activeTab === 'highDemand' && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm text-gray-700">Demand Trend</span>
                    <span className="font-bold text-orange-600">+{product.demandTrend}%</span>
                  </div>
                )}
                {activeTab === 'seasonal' && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-gray-700">Season</span>
                    <span className="font-bold text-purple-600">In Season</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Demand</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-secondary-600" />
                    <span className="font-semibold text-gray-900">{product.predicted_demand.toFixed(0)} units</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Stock</span>
                  <span className={`font-semibold ${product.stock > 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {product.stock > 100 ? 'In Stock' : 'Limited'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleViewDetails(product)}
                className="mt-4 w-full btn-primary text-sm"
              >
                View Details
              </button>
            </motion.div>
          ))}
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-xl">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Price Drop</p>
                <p className="text-2xl font-bold text-gray-900">8.5%</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Products on Sale</p>
                <p className="text-2xl font-bold text-gray-900">{trendingProducts.priceDrops.length}</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Demand Items</p>
                <p className="text-2xl font-bold text-gray-900">{trendingProducts.highDemand.length}</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Seasonal Picks</p>
                <p className="text-2xl font-bold text-gray-900">{trendingProducts.seasonal.length}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Market News & Updates</h2>
            <p className="text-sm text-gray-600 mt-1">Latest news affecting fruit and vegetable markets</p>
          </div>
          <Newspaper className="h-6 w-6 text-gray-400" />
        </div>
        <div className="space-y-4">
          {marketNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      news.impact === 'high' 
                        ? 'bg-red-100 text-red-700' 
                        : news.impact === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {news.category}
                    </span>
                    <span className="text-xs text-gray-500">{news.time}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{news.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{news.summary}</p>
                  <p className="text-xs text-gray-500">Source: {news.source}</p>
                </div>
                {news.impact === 'high' && (
                  <TrendingUp className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
export default Analytics