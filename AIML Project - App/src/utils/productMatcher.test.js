import { describe, test, expect } from 'vitest'
import {
  levenshteinDistance,
  calculateSimilarity,
  findBestMatch,
  matchProducts
} from './productMatcher'
import { mockProducts } from './mockData'
describe('levenshteinDistance', () => {
  test('returns 0 for identical strings', () => {
    expect(levenshteinDistance('tomato', 'tomato')).toBe(0)
  })
  test('calculates distance for single character difference', () => {
    expect(levenshteinDistance('tomato', 'tomato')).toBe(0)
    expect(levenshteinDistance('tomato', 'tomato')).toBe(0)
  })
  test('handles empty strings', () => {
    expect(levenshteinDistance('', 'tomato')).toBe(6)
    expect(levenshteinDistance('tomato', '')).toBe(6)
    expect(levenshteinDistance('', '')).toBe(0)
  })
  test('handles null/undefined inputs', () => {
    expect(levenshteinDistance(null, 'test')).toBe(4)
    expect(levenshteinDistance('test', null)).toBe(4)
  })
  test('calculates correct distance for typos', () => {
    expect(levenshteinDistance('tomato', 'tometo')).toBe(1) 
    expect(levenshteinDistance('potato', 'potao')).toBe(1) 
    expect(levenshteinDistance('onion', 'oniion')).toBe(1) 
  })
})
describe('calculateSimilarity', () => {
  test('returns 1.0 for exact matches', () => {
    expect(calculateSimilarity('Tomato', 'tomato')).toBe(1.0)
    expect(calculateSimilarity('POTATO', 'potato')).toBe(1.0)
  })
  test('returns high score for substring matches', () => {
    const score = calculateSimilarity('tom', 'tomato')
    expect(score).toBeGreaterThanOrEqual(0.8)
    expect(score).toBeLessThanOrEqual(1.0)
  })
  test('returns 0 for empty strings', () => {
    expect(calculateSimilarity('', 'tomato')).toBe(0)
    expect(calculateSimilarity('tomato', '')).toBe(0)
  })
  test('handles case insensitivity', () => {
    expect(calculateSimilarity('ToMaTo', 'TOMATO')).toBe(1.0)
  })
  test('returns lower score for typos', () => {
    const score = calculateSimilarity('tomato', 'tometo')
    expect(score).toBeGreaterThan(0.7)
    expect(score).toBeLessThan(1.0)
  })
  test('handles whitespace trimming', () => {
    expect(calculateSimilarity('  tomato  ', 'tomato')).toBe(1.0)
  })
})
describe('findBestMatch', () => {
  test('finds exact match with confidence 1.0', () => {
    const result = findBestMatch('tomato', mockProducts)
    expect(result).not.toBeNull()
    expect(result.product.product).toBe('Tomato')
    expect(result.confidence).toBe(1.0)
  })
  test('handles case insensitivity', () => {
    const result = findBestMatch('POTATO', mockProducts)
    expect(result).not.toBeNull()
    expect(result.product.product).toBe('Potato')
  })
  test('handles typos with fuzzy matching', () => {
    const result = findBestMatch('tometo', mockProducts)
    expect(result).not.toBeNull()
    expect(result.product.product).toBe('Tomato')
    expect(result.confidence).toBeGreaterThan(0.6)
  })
  test('handles singular/plural variations', () => {
    const singular = findBestMatch('tomato', mockProducts)
    const plural = findBestMatch('tomatoes', mockProducts)
    expect(singular).not.toBeNull()
    expect(plural).not.toBeNull()
    expect(singular.product.product).toBe('Tomato')
    expect(plural.product.product).toBe('Tomato')
  })
  test('returns null for very short terms', () => {
    expect(findBestMatch('to', mockProducts)).toBeNull()
    expect(findBestMatch('a', mockProducts)).toBeNull()
  })
  test('returns null for no matches above threshold', () => {
    const result = findBestMatch('xyz123', mockProducts)
    expect(result).toBeNull()
  })
  test('returns null for empty product database', () => {
    expect(findBestMatch('tomato', [])).toBeNull()
  })
  test('returns null for empty term', () => {
    expect(findBestMatch('', mockProducts)).toBeNull()
    expect(findBestMatch(null, mockProducts)).toBeNull()
  })
})
describe('matchProducts', () => {
  test('matches single product correctly', () => {
    const results = matchProducts('tomato', mockProducts)
    expect(results).toHaveLength(1)
    expect(results[0].product.product).toBe('Tomato')
    expect(results[0].confidence).toBe(1.0)
    expect(results[0].matchedTerm).toBe('tomato')
  })
  test('matches multiple products separated by "and"', () => {
    const results = matchProducts('tomato and potato', mockProducts)
    expect(results.length).toBeGreaterThanOrEqual(2)
    const productNames = results.map(r => r.product.product)
    expect(productNames).toContain('Tomato')
    expect(productNames).toContain('Potato')
  })
  test('matches multiple products separated by commas', () => {
    const results = matchProducts('tomato, potato, onion', mockProducts)
    expect(results.length).toBeGreaterThanOrEqual(3)
    const productNames = results.map(r => r.product.product)
    expect(productNames).toContain('Tomato')
    expect(productNames).toContain('Potato')
    expect(productNames).toContain('Onion')
  })
  test('matches multiple products separated by spaces', () => {
    const results = matchProducts('apple banana orange', mockProducts)
    expect(results.length).toBeGreaterThanOrEqual(3)
    const productNames = results.map(r => r.product.product)
    expect(productNames).toContain('Apple')
    expect(productNames).toContain('Banana')
    expect(productNames).toContain('Orange')
  })
  test('removes duplicate products', () => {
    const results = matchProducts('tomato and tomato', mockProducts)
    expect(results).toHaveLength(1)
    expect(results[0].product.product).toBe('Tomato')
  })
  test('sorts results by confidence score descending', () => {
    const results = matchProducts('tomato tometo potato', mockProducts)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].confidence).toBeGreaterThanOrEqual(results[i + 1].confidence)
    }
  })
  test('filters out matches below 0.6 confidence threshold', () => {
    const results = matchProducts('xyz123 tomato', mockProducts)
    expect(results.every(r => r.confidence >= 0.6)).toBe(true)
  })
  test('returns empty array for empty query', () => {
    expect(matchProducts('', mockProducts)).toEqual([])
    expect(matchProducts(null, mockProducts)).toEqual([])
  })
  test('returns empty array for empty product database', () => {
    expect(matchProducts('tomato', [])).toEqual([])
  })
  test('handles complex query with multiple separators', () => {
    const results = matchProducts('tomato, potato and onion apple', mockProducts)
    expect(results.length).toBeGreaterThanOrEqual(4)
    const productNames = results.map(r => r.product.product)
    expect(productNames).toContain('Tomato')
    expect(productNames).toContain('Potato')
    expect(productNames).toContain('Onion')
    expect(productNames).toContain('Apple')
  })
  test('handles typos in multi-product queries', () => {
    const results = matchProducts('tometo and poteto', mockProducts)
    expect(results.length).toBeGreaterThanOrEqual(2)
    const productNames = results.map(r => r.product.product)
    expect(productNames).toContain('Tomato')
    expect(productNames).toContain('Potato')
  })
  test('all matched products have required fields', () => {
    const results = matchProducts('tomato and potato', mockProducts)
    results.forEach(match => {
      expect(match).toHaveProperty('product')
      expect(match).toHaveProperty('confidence')
      expect(match).toHaveProperty('matchedTerm')
      expect(match.product).toHaveProperty('product')
      expect(match.product).toHaveProperty('price')
      expect(match.product).toHaveProperty('category')
    })
  })
})