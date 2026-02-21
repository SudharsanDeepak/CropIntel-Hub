export class ConversationManager {
  constructor(maxHistory = 10) {
    this.messages = []
    this.maxHistory = maxHistory
    this.maxMessages = maxHistory * 2 
  }
  addMessage(role, content, metadata = {}) {
    if (!role || !content) {
      return
    }
    const normalizedRole = role.toLowerCase()
    if (normalizedRole !== 'user' && normalizedRole !== 'assistant') {
      return
    }
    const message = {
      role: normalizedRole,
      content: content,
      timestamp: new Date(),
      metadata: { ...metadata }
    }
    this.messages.push(message)
    if (this.messages.length > this.maxMessages) {
      this.messages.shift()
    }
  }
  getHistory(lastN = 10) {
    const messageCount = Math.min(lastN * 2, this.messages.length)
    return this.messages
      .slice(-messageCount)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))
  }
  getRecentProducts(lastN = 3) {
    const userMessages = this.messages.filter(msg => msg.role === 'user')
    const recentUserMessages = userMessages.slice(-lastN)
    const products = []
    const seenProducts = new Set()
    for (const message of recentUserMessages) {
      if (message.metadata && message.metadata.products) {
        for (const product of message.metadata.products) {
          if (!seenProducts.has(product)) {
            products.push(product)
            seenProducts.add(product)
          }
        }
      }
    }
    return products
  }
  resolveReferences(query) {
    if (!query || typeof query !== 'string') {
      return query
    }
    let resolvedQuery = query
    const lowerQuery = query.toLowerCase()
    const recentProducts = this.getRecentProducts(3)
    if (recentProducts.length === 0) {
      return query 
    }
    if (/\b(it|that product|that one)\b/i.test(lowerQuery)) {
      if (recentProducts.length >= 1) {
        const lastProduct = recentProducts[recentProducts.length - 1]
        resolvedQuery = resolvedQuery.replace(/\b(it|that product|that one)\b/gi, lastProduct)
      }
    }
    if (/\b(them|those|these|those products|these products)\b/i.test(lowerQuery)) {
      if (recentProducts.length > 1) {
        const productList = recentProducts.join(' and ')
        resolvedQuery = resolvedQuery.replace(/\b(them|those|these|those products|these products)\b/gi, productList)
      } else if (recentProducts.length === 1) {
        resolvedQuery = resolvedQuery.replace(/\b(them|those|these|those products|these products)\b/gi, recentProducts[0])
      }
    }
    if (/\bthe same\b/i.test(lowerQuery)) {
      if (recentProducts.length >= 1) {
        const lastProduct = recentProducts[recentProducts.length - 1]
        resolvedQuery = resolvedQuery.replace(/\bthe same\b/gi, lastProduct)
      }
    }
    return resolvedQuery
  }
  clear() {
    this.messages = []
  }
  getContextSummary() {
    if (this.messages.length === 0) {
      return 'No previous conversation context.'
    }
    const recentProducts = this.getRecentProducts(3)
    const recentIntents = this.messages
      .filter(msg => msg.role === 'user' && msg.metadata && msg.metadata.intent)
      .slice(-3)
      .map(msg => msg.metadata.intent)
    let summary = 'Recent conversation context:\n'
    if (recentProducts.length > 0) {
      summary += `- Recently discussed products: ${recentProducts.join(', ')}\n`
    }
    if (recentIntents.length > 0) {
      summary += `- Recent user intents: ${recentIntents.join(', ')}\n`
    }
    summary += `- Total messages in history: ${this.messages.length}\n`
    return summary
  }
}