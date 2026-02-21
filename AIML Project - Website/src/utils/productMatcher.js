export function levenshteinDistance(str1, str2) {
  if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0)
  if (str1 === str2) return 0
  const len1 = str1.length
  const len2 = str2.length
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0))
  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      
        matrix[i][j - 1] + 1,      
        matrix[i - 1][j - 1] + cost 
      )
    }
  }
  return matrix[len1][len2]
}
export function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  if (s1 === s2) return 1.0
  const longer = s1.length >= s2.length ? s1 : s2
  const shorter = s1.length < s2.length ? s1 : s2
  if (longer.includes(shorter)) {
    const lengthRatio = shorter.length / longer.length
    return 0.8 + (lengthRatio * 0.2)
  }
  const distance = levenshteinDistance(s1, s2)
  const maxLength = Math.max(s1.length, s2.length)
  const similarity = 1 - (distance / maxLength)
  return Math.max(0, similarity)
}
export function findBestMatch(term, products) {
  if (!term || !products || products.length === 0) return null
  const normalizedTerm = term.toLowerCase().trim()
  if (normalizedTerm.length <= 2) return null
  let bestMatch = null
  let bestScore = 0
  const variations = [normalizedTerm]
  if (normalizedTerm.endsWith('s') && normalizedTerm.length > 3) {
    variations.push(normalizedTerm.slice(0, -1))
  }
  if (!normalizedTerm.endsWith('s')) {
    variations.push(normalizedTerm + 's')
  }
  for (const variation of variations) {
    for (const product of products) {
      const similarity = calculateSimilarity(variation, product.product)
      if (similarity > bestScore) {
        bestScore = similarity
        bestMatch = product
      }
    }
  }
  if (bestScore >= 0.6) {
    return {
      product: bestMatch,
      confidence: bestScore
    }
  }
  return null
}
export function matchProducts(queryText, products) {
  if (!queryText || !products || products.length === 0) return []
  const tokens = queryText
    .toLowerCase()
    .split(/[\s,]+|and/)
    .map(t => t.trim())
    .filter(t => t.length > 0)
  const matches = []
  const seenProducts = new Set()
  for (const token of tokens) {
    const match = findBestMatch(token, products)
    if (match && !seenProducts.has(match.product.product)) {
      matches.push({
        product: match.product,
        confidence: match.confidence,
        matchedTerm: token
      })
      seenProducts.add(match.product.product)
    }
  }
  matches.sort((a, b) => b.confidence - a.confidence)
  return matches
}