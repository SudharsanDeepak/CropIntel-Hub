import { INTENT_TYPES } from './queryParser.js'
function formatPrice(price) {
  if (typeof price !== 'number' || isNaN(price)) {
    return '₹0.00/kg'
  }
  return `₹${price.toFixed(2)}/kg`
}
function limitEmojis(text) {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
  const emojis = text.match(emojiRegex) || []
  if (emojis.length <= 3) {
    return text
  }
  let count = 0
  return text.replace(emojiRegex, (match) => {
    count++
    return count <= 3 ? match : ''
  })
}
export function handlePriceCheck(matchedProducts) {
  if (!matchedProducts || matchedProducts.length === 0) {
    return "I couldn't find any products matching your query. Could you please specify which product you're interested in? 🤔"
  }
  if (matchedProducts.length === 1) {
    const { product, confidence } = matchedProducts[0]
    if (confidence < 0.7) {
      return `Did you mean **${product.product}**? It's currently priced at **${formatPrice(product.price)}**. If not, please clarify which product you're looking for. 🔍`
    }
    return `**${product.product}** is currently priced at **${formatPrice(product.price)}** 📊\n\nStock: ${product.stock} units available\nPredicted demand: ${product.predicted_demand} units`
  }
  let response = "Here are the current prices:\n\n"
  matchedProducts.forEach((match, index) => {
    const { product } = match
    response += `${index + 1}. **${product.product}**: **${formatPrice(product.price)}**\n`
  })
  response += "\n💡 Need more details about any specific product? Just ask!"
  return limitEmojis(response)
}
export function handleComparison(matchedProducts) {
  if (!matchedProducts || matchedProducts.length < 2) {
    return "I need at least two products to compare. Please specify which products you'd like to compare. 🔄"
  }
  const sorted = [...matchedProducts].sort((a, b) => a.product.price - b.product.price)
  let response = "Here's a detailed comparison:\n\n"
  sorted.forEach((match, index) => {
    const { product } = match
    response += `${index + 1}. **${product.product}**\n`
    response += `   - Price: **${formatPrice(product.price)}**\n`
    response += `   - Stock: ${product.stock} units\n`
    response += `   - Demand: ${product.predicted_demand} units\n\n`
  })
  const cheapest = sorted[0].product
  const mostExpensive = sorted[sorted.length - 1].product
  const priceDiff = mostExpensive.price - cheapest.price
  response += `💰 **${cheapest.product}** is the most affordable at **${formatPrice(cheapest.price)}**\n`
  response += `📈 Price difference: ₹${priceDiff.toFixed(2)}/kg between cheapest and most expensive`
  return limitEmojis(response)
}
export function handleRecommendation(allProducts, criteria) {
  if (!allProducts || allProducts.length === 0) {
    return "I don't have product data available right now. Please try again later. 😔"
  }
  let filtered = [...allProducts]
  if (criteria.categories && criteria.categories.length > 0) {
    filtered = filtered.filter(p => criteria.categories.includes(p.category))
  }
  if (criteria.cheap) {
    filtered = filtered.filter(p => p.price <= 50)
  }
  filtered.sort((a, b) => a.price - b.price)
  const recommendations = filtered.slice(0, 6)
  if (recommendations.length === 0) {
    return "I couldn't find products matching your criteria. Try adjusting your requirements! 🔍"
  }
  let response = "Here are my recommendations:\n\n"
  recommendations.forEach((product, index) => {
    response += `${index + 1}. **${product.product}** - **${formatPrice(product.price)}**\n`
  })
  response += "\n✨ These products offer great value for your needs!"
  return limitEmojis(response)
}
export function handleBestDeals(allProducts, limit = 6) {
  if (!allProducts || allProducts.length === 0) {
    return "I don't have product data available right now. Please try again later. 😔"
  }
  const sorted = [...allProducts].sort((a, b) => a.price - b.price)
  const bestDeals = sorted.slice(0, limit)
  let response = "🎉 **Best Deals Right Now:**\n\n"
  bestDeals.forEach((product, index) => {
    response += `${index + 1}. **${product.product}** - **${formatPrice(product.price)}**\n`
    response += `   Stock: ${product.stock} units available\n\n`
  })
  response += "💡 Grab these deals while stocks last!"
  return limitEmojis(response)
}
export function handleCategoryList(allProducts, category) {
  if (!allProducts || allProducts.length === 0) {
    return "I don't have product data available right now. Please try again later. 😔"
  }
  const filtered = allProducts.filter(p => p.category === category)
  if (filtered.length === 0) {
    return `I couldn't find any products in the ${category} category. 🤔`
  }
  filtered.sort((a, b) => a.product.localeCompare(b.product))
  const emoji = category === 'vegetable' ? '🥬' : '🍎'
  let response = `${emoji} **${category.charAt(0).toUpperCase() + category.slice(1)}s Available (${filtered.length} items):**\n\n`
  filtered.forEach((product, index) => {
    response += `${index + 1}. **${product.product}** - **${formatPrice(product.price)}**\n`
  })
  response += `\n💡 Want to know more about any specific ${category}? Just ask!`
  return limitEmojis(response)
}
export function handleForecast() {
  return `📈 **Price Forecasting Feature**
I can help you understand price trends! However, for detailed forecasts, please visit the Analytics page where you can:
• View historical price trends
• See predicted demand patterns
• Analyze seasonal variations
• Get AI-powered price predictions
💡 You can also ask me about current prices and I'll provide the latest data!`
}
export function handleAlertSetup() {
  return `🔔 **Price Alert Setup**
I'd love to help you set up price alerts! This feature allows you to:
• Get notified when prices drop
• Track specific products
• Set custom price thresholds
• Receive timely updates
💡 To set up alerts, please use the Alert Management section in the main dashboard. You can configure alerts for any product you're interested in!`
}
export function handleHelp() {
  return `👋 **Welcome! I'm your Market Guide Assistant**
I can help you with:
1. **Price Checks** - "What's the price of tomato?"
2. **Comparisons** - "Compare potato and onion"
3. **Recommendations** - "Suggest cheap vegetables"
4. **Best Deals** - "Show me the cheapest products"
5. **Category Lists** - "List all fruits"
6. **Product Info** - Ask about stock, demand, or availability
💡 **Tips:**
• Ask naturally - I understand conversational language
• Compare multiple products at once
• Ask follow-up questions - I remember our conversation
🚀 Try asking: "What are the best deals today?" or "Compare apple and banana prices"`
}
export function generateFallbackResponse(query, parsedQuery, matchedProducts, allProducts, conversationContext) {
  if (!query || !parsedQuery) {
    return handleHelp()
  }
  const { intent, entities } = parsedQuery
  switch (intent) {
    case INTENT_TYPES.PRICE_CHECK:
      return handlePriceCheck(matchedProducts)
    case INTENT_TYPES.COMPARISON:
      return handleComparison(matchedProducts)
    case INTENT_TYPES.RECOMMENDATION:
      return handleRecommendation(allProducts, entities.criteria || {})
    case INTENT_TYPES.BEST_DEALS:
      return handleBestDeals(allProducts, 6)
    case INTENT_TYPES.CATEGORY_LIST:
      const category = entities.categories && entities.categories.length > 0
        ? entities.categories[0]
        : 'vegetable' 
      return handleCategoryList(allProducts, category)
    case INTENT_TYPES.FORECAST:
      return handleForecast()
    case INTENT_TYPES.ALERT_SETUP:
      return handleAlertSetup()
    case INTENT_TYPES.HELP:
      return handleHelp()
    case INTENT_TYPES.UNKNOWN:
    default:
      const lowerQuery = query?.toLowerCase() || ''
      if (/(weather|rain|temperature|climate|condition|sunny|cloudy|hot|cold)/.test(lowerQuery)) {
        return `I understand you're asking about weather conditions! 🌤️
While I don't have real-time weather data, I can help you with:
• **Product prices** affected by weather
• **Seasonal recommendations** based on current season
• **Market trends** and supply information
• **Best deals** on fresh produce
For detailed weather forecasts and their impact on prices, please visit the **Analytics page** where you can see:
- Weather impact analysis
- Price predictions based on weather
- Supply chain updates
💡 Try asking: "What are the seasonal picks?" or "Show me fresh vegetables"`
      }
      if (matchedProducts && matchedProducts.length > 0) {
        return handlePriceCheck(matchedProducts)
      }
      return `I'm not sure I understood that correctly. 🤔
Here's what I can help you with:
• Check prices: "What's the price of tomato?"
• Compare products: "Compare potato and onion"
• Find deals: "Show me the cheapest products"
• Get recommendations: "Suggest fresh vegetables"
💡 Try rephrasing your question, or type "help" to see all features!`
  }
}