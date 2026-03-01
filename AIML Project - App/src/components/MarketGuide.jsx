import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import axiosInstance from '../utils/axiosConfig'
import { matchProducts } from '../utils/productMatcher'
import { parseQuery } from '../utils/queryParser'
import { ConversationManager } from '../utils/conversationManager'
import { generateFallbackResponse } from '../utils/fallbackSystem'
import { Capacitor } from '@capacitor/core'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const MarketGuide = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm your Market Guide. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [products, setProducts] = useState([])
  const [conversationManager] = useState(() => new ConversationManager(10))
  const messagesEndRef = useRef(null)
  const productRefreshInterval = useRef(null)
  const debounceTimeout = useRef(null)
  const isNative = Capacitor.isNativePlatform()
  useEffect(() => {
    fetchProducts()
    productRefreshInterval.current = setInterval(fetchProducts, 5 * 60 * 1000)
    return () => {
      if (productRefreshInterval.current) {
        clearInterval(productRefreshInterval.current)
      }
    }
  }, [])
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  useEffect(() => {
    if (!isOpen) {
      conversationManager.clear()
    }
  }, [isOpen, conversationManager])
  const fetchProducts = async (retryCount = 0) => {
    try {
      const response = await axiosInstance.get('/api/products/latest')
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      
      // Retry logic: retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/2)`)
        setTimeout(() => fetchProducts(retryCount + 1), delay)
      } else {
        // Keep existing products if fetch fails after retries
        console.warn('Failed to fetch products after retries, using cached data')
      }
    }
  }
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const callGroq = async (userMessage, conversationManager, apiKey) => {
    try {
      const productList = products.slice(0, 50).map(p => 
        `${p.product}: ₹${p.price.toFixed(2)}/kg`
      ).join(', ')
      
      const conversationHistory = conversationManager.getHistory(3)
      const messages = [
        {
          role: 'system',
          content: `You are Market Guide for a fruit & vegetable market platform. Current products: ${productList}. Help users find prices, recommend deals, and provide market insights. Be concise and helpful.`
        },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ]

      console.log('📤 Sending request to Groq API...')
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Groq API error details:', errorData)
        throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      const aiResponse = data.choices?.[0]?.message?.content
      
      if (!aiResponse || aiResponse.length < 10) {
        throw new Error('Invalid response from Groq')
      }
      
      console.log('✅ Groq API response received')
      return aiResponse
      
    } catch (error) {
      console.error('Groq API error:', error)
      throw error
    }
  }
  const renderMarkdown = (text) => {
    if (!text) return text
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2)
        return <strong key={index} className="font-semibold">{boldText}</strong>
      }
      return <span key={index}>{part}</span>
    })
  }
  const quickActions = [
    { icon: DollarSign, text: 'Best Deals Today', action: 'best_deals' },
    { icon: TrendingUp, text: 'Price Trends', action: 'price_trends' },
    { icon: Package, text: 'Product Info', action: 'product_info' },
    { icon: Calendar, text: 'Seasonal Picks', action: 'seasonal' }
  ]
  const processMessage = async (userMessage) => {
    try {
      const resolvedMessage = conversationManager.resolveReferences(userMessage)
      const parsedQuery = parseQuery(resolvedMessage, products)
      const matchedProducts = matchProducts(resolvedMessage, products)
      conversationManager.addMessage('user', userMessage, {
        products: matchedProducts.map(m => m.product.product),
        intent: parsedQuery.intent
      })
      const apiKey = import.meta.env.VITE_GROQ_API_KEY
      console.log('🔑 API Key check:', {
        exists: !!apiKey,
        startsWithGsk: apiKey?.startsWith('gsk_'),
        length: apiKey?.length,
        first10: apiKey?.substring(0, 10)
      })
      
      const isValidKey = apiKey && apiKey.startsWith('gsk_')
      
      if (isValidKey) {
        console.log('✅ Using Groq API')
        try {
          const aiResponse = await callGroq(resolvedMessage, conversationManager, apiKey)
          conversationManager.addMessage('assistant', aiResponse, {
            products: matchedProducts.map(m => m.product.product)
          })
          return aiResponse
        } catch (error) {
          console.error('❌ Groq API failed:', error.message)
        }
      } else {
        console.log('⚠️ Using fallback system (no valid API key)')
      }
      const fallbackResponse = generateFallbackResponse(
        resolvedMessage,
        parsedQuery,
        matchedProducts,
        products,
        conversationManager.getContextSummary()
      )
      conversationManager.addMessage('assistant', fallbackResponse, {
        products: matchedProducts.map(m => m.product.product)
      })
      return fallbackResponse
    } catch (error) {
      console.error('Error processing message:', error)
      return "I encountered an unexpected issue. Please try rephrasing your question or contact support if this persists. 😔"
    }
  }
  const callOpenAI = async (userMessage, conversationManager, apiKey) => {
    const isGemini = apiKey.startsWith('AIza')
    if (isGemini) {
      return await callGemini(userMessage, conversationManager, apiKey)
    }
    const productList = products.map(p => 
      `${p.product}: ₹${p.price.toFixed(2)}/kg (${p.category}, Demand: ${p.predicted_demand.toFixed(0)} units, Stock: ${p.stock})`
    ).join('\n')
    const conversationHistory = conversationManager.getHistory(10)
    const systemMessage = `You are Market Guide, an intelligent AI assistant for a fruit and vegetable market intelligence platform.
CURRENT PRODUCT DATABASE (${products.length} products):
${productList}
YOUR ROLE:
- Help users find product prices and information
- Recommend best deals and seasonal products
- Explain market trends and weather impacts
- Guide users to platform features (Alerts, Compare, Forecast, Analytics)
- Provide accurate, helpful, and friendly responses
PLATFORM FEATURES:
1. Price Tracker - View real-time prices for 180+ products
2. Forecast - See 7-day price and demand predictions
3. Compare - Compare up to 4 products side-by-side
4. Analytics - Market insights, weather impact, trending products
5. Alerts - Set email notifications for target prices
RESPONSE GUIDELINES:
- Always use EXACT product names and prices from the database above
- When asked about multiple products, provide info for ALL of them
- Format prices as ₹XX.XX/kg
- Be conversational, helpful, and concise (max 500 tokens)
- If a product isn't in the database, suggest similar alternatives
- Recommend relevant platform features when appropriate
- Use emojis sparingly (max 3 per response)
Answer the user's question accurately based on the product data above.`
    const messages = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) 
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key')
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded')
        } else if (response.status >= 500) {
          throw new Error('OpenAI server error')
        } else {
          throw new Error(`HTTP error ${response.status}`)
        }
      }
      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content
      if (!aiResponse || aiResponse.length < 10) {
        throw new Error('Invalid response from OpenAI')
      }
      return aiResponse
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      return
    }
    let messageToSend = inputMessage.trim()
    if (messageToSend.length > 500) {
      messageToSend = messageToSend.substring(0, 500)
    }
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageToSend,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    debounceTimeout.current = setTimeout(async () => {
      try {
        const botResponse = await processMessage(messageToSend)
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: botResponse,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } catch (error) {
        console.error('Error in handleSendMessage:', error)
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: "I encountered an unexpected issue. Please try again. 😔",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    }, 100)
  }
  const handleQuickAction = async (action) => {
    let message = ''
    switch (action) {
      case 'best_deals':
        message = 'Show me the best deals today'
        break
      case 'price_trends':
        message = 'What are the current price trends?'
        break
      case 'product_info':
        message = 'Tell me about product prices'
        break
      case 'seasonal':
        message = 'What are the seasonal picks?'
        break
    }
    setInputMessage(message)
    setTimeout(() => handleSendMessage(), 100)
  }
  return (
    <>
      {}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all z-50 flex items-center justify-center group"
          >
            <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>
      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-full sm:h-[600px] sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {}
            <div className={`bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white flex items-center justify-between ${isNative ? 'safe-area-top' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Market Guide</h3>
                  <p className="text-xs text-primary-100">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {}
            <div className="px-3 sm:px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors whitespace-nowrap border border-gray-200"
                  >
                    <action.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{action.text}</span>
                    <span className="sm:hidden">{action.text.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
            {}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] sm:max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' ? 'bg-primary-600' : 'bg-gradient-to-r from-secondary-500 to-secondary-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      }`}>
                        <div className="text-xs sm:text-sm whitespace-pre-line break-words">
                          {renderMarkdown(message.text)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200 safe-area-bottom">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Powered by Market Intelligence AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
export default MarketGuide