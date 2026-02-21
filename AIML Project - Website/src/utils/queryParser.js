export const INTENT_TYPES = {
  PRICE_CHECK: 'price_check',
  COMPARISON: 'comparison',
  RECOMMENDATION: 'recommendation',
  FORECAST: 'forecast',
  ALERT_SETUP: 'alert_setup',
  BEST_DEALS: 'best_deals',
  CATEGORY_LIST: 'category_list',
  HELP: 'help',
  UNKNOWN: 'unknown'
}
export function detectIntent(query) {
  const lowerQuery = query.toLowerCase().trim()
  if (/^(help|what can you do|how does this work|show me features|guide|assist)/.test(lowerQuery)) {
    return INTENT_TYPES.HELP
  }
  if (/(compare|comparison|vs|versus|difference between|which is (cheaper|better|more expensive))/.test(lowerQuery)) {
    return INTENT_TYPES.COMPARISON
  }
  if (/(cheapest|best deals?|most affordable|lowest price|on sale|bargain)/.test(lowerQuery)) {
    return INTENT_TYPES.BEST_DEALS
  }
  if (/(recommend|suggest|what (should|can) i (buy|get)|show me|best|good|fresh|seasonal)/.test(lowerQuery)) {
    return INTENT_TYPES.RECOMMENDATION
  }
  if (/(forecast|predict|future|tomorrow|next (week|month)|will be|expected|trend)/.test(lowerQuery)) {
    return INTENT_TYPES.FORECAST
  }
  if (/(alert|notify|notification|remind|set (up )?alert|let me know|inform me)/.test(lowerQuery)) {
    return INTENT_TYPES.ALERT_SETUP
  }
  if (/(list|show|display|what|all) .*(vegetables?|fruits?)/.test(lowerQuery) || 
      /(vegetables?|fruits?) .*(list|available|have|stock)/.test(lowerQuery)) {
    return INTENT_TYPES.CATEGORY_LIST
  }
  if (/(price|cost|how much|rate|value) (of|for|is)?/.test(lowerQuery) || 
      /what (is|are) (the )?(price|cost)/.test(lowerQuery)) {
    return INTENT_TYPES.PRICE_CHECK
  }
  if (/(weather|rain|temperature|climate|forecast|condition|sunny|cloudy|hot|cold)/.test(lowerQuery)) {
    return INTENT_TYPES.HELP 
  }
  return INTENT_TYPES.UNKNOWN
}
export function extractTemporalReferences(query) {
  const lowerQuery = query.toLowerCase()
  const now = new Date()
  if (/\btoday\b/.test(lowerQuery)) {
    return { type: 'today', date: now }
  }
  if (/\btomorrow\b/.test(lowerQuery)) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { type: 'tomorrow', date: tomorrow }
  }
  if (/\bthis week\b/.test(lowerQuery)) {
    return { type: 'this_week', date: now }
  }
  if (/\bnext week\b/.test(lowerQuery)) {
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    return { type: 'next_week', date: nextWeek }
  }
  if (/\bthis month\b/.test(lowerQuery)) {
    return { type: 'this_month', date: now }
  }
  if (/\bnext month\b/.test(lowerQuery)) {
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return { type: 'next_month', date: nextMonth }
  }
  return { type: null, date: null }
}
export function detectComparison(query) {
  const lowerQuery = query.toLowerCase()
  const hasComparisonKeyword = /(compare|comparison|vs|versus|difference between|which is (cheaper|better|more expensive))/.test(lowerQuery)
  if (!hasComparisonKeyword) {
    return { isComparison: false, products: [] }
  }
  const products = []
  const compareAndMatch = lowerQuery.match(/compare\s+(.+?)\s+and\s+(.+?)(?:\s|$|[?.!])/i)
  if (compareAndMatch) {
    products.push(compareAndMatch[1].trim(), compareAndMatch[2].trim())
  }
  const vsMatch = lowerQuery.match(/(.+?)\s+(?:vs|versus)\s+(.+?)(?:\s|$|[?.!])/i)
  if (vsMatch && products.length === 0) {
    products.push(vsMatch[1].trim(), vsMatch[2].trim())
  }
  const diffMatch = lowerQuery.match(/difference\s+between\s+(.+?)\s+and\s+(.+?)(?:\s|$|[?.!])/i)
  if (diffMatch && products.length === 0) {
    products.push(diffMatch[1].trim(), diffMatch[2].trim())
  }
  return {
    isComparison: true,
    products: products
  }
}
function extractPriceRange(query) {
  const lowerQuery = query.toLowerCase()
  const underMatch = lowerQuery.match(/(?:under|below|less than|cheaper than)\s+(?:₹|rs\.?|rupees?)?\s*(\d+)/i)
  if (underMatch) {
    return { min: null, max: parseInt(underMatch[1]) }
  }
  const aboveMatch = lowerQuery.match(/(?:above|over|more than|expensive than)\s+(?:₹|rs\.?|rupees?)?\s*(\d+)/i)
  if (aboveMatch) {
    return { min: parseInt(aboveMatch[1]), max: null }
  }
  const betweenMatch = lowerQuery.match(/between\s+(?:₹|rs\.?|rupees?)?\s*(\d+)\s+and\s+(?:₹|rs\.?|rupees?)?\s*(\d+)/i)
  if (betweenMatch) {
    return { min: parseInt(betweenMatch[1]), max: parseInt(betweenMatch[2]) }
  }
  if (/(cheap|affordable|budget|economical)/.test(lowerQuery)) {
    return { min: null, max: 50 }
  }
  if (/(expensive|premium|costly|high-end)/.test(lowerQuery)) {
    return { min: 80, max: null }
  }
  return { min: null, max: null }
}
function extractCategories(query) {
  const lowerQuery = query.toLowerCase()
  const categories = []
  if (/\bvegetables?\b/.test(lowerQuery)) {
    categories.push('vegetable')
  }
  if (/\bfruits?\b/.test(lowerQuery)) {
    categories.push('fruit')
  }
  return categories
}
function extractRecommendationCriteria(query) {
  const lowerQuery = query.toLowerCase()
  const criteria = {
    cheap: false,
    seasonal: false,
    fresh: false,
    categories: []
  }
  if (/(cheap|affordable|budget|economical|inexpensive)/.test(lowerQuery)) {
    criteria.cheap = true
  }
  if (/(seasonal|season|in season)/.test(lowerQuery)) {
    criteria.seasonal = true
  }
  if (/(fresh|freshest|new|recently)/.test(lowerQuery)) {
    criteria.fresh = true
  }
  criteria.categories = extractCategories(query)
  return criteria
}
function handleNegations(query) {
  const lowerQuery = query.toLowerCase()
  const excludeCategories = []
  if (/(not|no|except|excluding|without)\s+(vegetables?|veggies?)/.test(lowerQuery)) {
    excludeCategories.push('vegetable')
  }
  if (/(not|no|except|excluding|without)\s+(fruits?)/.test(lowerQuery)) {
    excludeCategories.push('fruit')
  }
  return {
    hasNegation: excludeCategories.length > 0,
    excludeCategories
  }
}
export function parseQuery(query, products = []) {
  if (!query || typeof query !== 'string') {
    return {
      intent: INTENT_TYPES.UNKNOWN,
      entities: {
        products: [],
        categories: [],
        priceRange: { min: null, max: null },
        temporal: { type: null, date: null },
        criteria: {}
      },
      isComparison: false,
      isMultiProduct: false,
      confidence: 0,
      negation: { hasNegation: false, excludeCategories: [] }
    }
  }
  const trimmedQuery = query.trim()
  const intent = detectIntent(trimmedQuery)
  const temporal = extractTemporalReferences(trimmedQuery)
  const comparison = detectComparison(trimmedQuery)
  const categories = extractCategories(trimmedQuery)
  const priceRange = extractPriceRange(trimmedQuery)
  const criteria = extractRecommendationCriteria(trimmedQuery)
  const negation = handleNegations(trimmedQuery)
  const productNames = []
  if (comparison.isComparison && comparison.products.length > 0) {
    productNames.push(...comparison.products)
  }
  let confidence = 0.5 
  if (intent !== INTENT_TYPES.UNKNOWN) {
    confidence += 0.3
  }
  if (productNames.length > 0 || categories.length > 0) {
    confidence += 0.2
  }
  if (temporal.type !== null || priceRange.min !== null || priceRange.max !== null) {
    confidence += 0.1
  }
  confidence = Math.min(confidence, 1.0)
  return {
    intent,
    entities: {
      products: productNames,
      categories,
      priceRange,
      temporal,
      criteria
    },
    isComparison: comparison.isComparison,
    isMultiProduct: productNames.length > 1,
    confidence,
    negation
  }
}