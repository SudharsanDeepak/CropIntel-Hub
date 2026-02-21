import { describe, it, expect } from 'vitest'
import { mockProducts } from './mockData'
describe('Testing Framework Setup', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })
  it('should load mock data correctly', () => {
    expect(mockProducts).toBeDefined()
    expect(Array.isArray(mockProducts)).toBe(true)
    expect(mockProducts.length).toBeGreaterThan(0)
  })
  it('should have product data with correct structure', () => {
    const product = mockProducts[0]
    expect(product).toHaveProperty('product')
    expect(product).toHaveProperty('price')
    expect(product).toHaveProperty('category')
    expect(product).toHaveProperty('predicted_demand')
    expect(product).toHaveProperty('stock')
  })
})