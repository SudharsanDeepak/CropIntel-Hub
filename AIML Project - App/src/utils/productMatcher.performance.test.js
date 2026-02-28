import { describe, test, expect } from 'vitest'
import { matchProducts } from './productMatcher'
function generateLargeProductDatabase(count = 180) {
  const products = []
  const vegetables = ['Tomato', 'Potato', 'Onion', 'Carrot', 'Cabbage', 'Cauliflower', 'Broccoli', 'Spinach', 'Cucumber', 'Bell Pepper']
  const fruits = ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Watermelon', 'Pineapple', 'Strawberry', 'Papaya', 'Pomegranate']
  for (let i = 0; i < count; i++) {
    const isVegetable = i % 2 === 0
    const baseNames = isVegetable ? vegetables : fruits
    const baseName = baseNames[i % baseNames.length]
    products.push({
      product: `${baseName} ${Math.floor(i / 10) + 1}`,
      price: 20 + Math.random() * 180,
      category: isVegetable ? 'vegetable' : 'fruit',
      predicted_demand: Math.floor(Math.random() * 2000) + 500,
      stock: Math.floor(Math.random() * 300) + 50
    })
  }
  return products
}
describe('Product Matcher Performance', () => {
  test('matchProducts completes in <100ms for 180 products', () => {
    const products = generateLargeProductDatabase(180)
    const query = 'tomato and potato'
    const start = performance.now()
    const results = matchProducts(query, products)
    const duration = performance.now() - start
    console.log(`Performance: matchProducts took ${duration.toFixed(2)}ms for 180 products`)
    expect(duration).toBeLessThan(100)
    expect(results.length).toBeGreaterThan(0)
  })
  test('matchProducts handles complex multi-product query efficiently', () => {
    const products = generateLargeProductDatabase(180)
    const query = 'tomato, potato, onion, carrot, apple, banana, orange, mango'
    const start = performance.now()
    const results = matchProducts(query, products)
    const duration = performance.now() - start
    console.log(`Performance: Complex query took ${duration.toFixed(2)}ms for 180 products`)
    expect(duration).toBeLessThan(100)
    expect(results.length).toBeGreaterThan(0)
  })
  test('matchProducts handles typos efficiently', () => {
    const products = generateLargeProductDatabase(180)
    const query = 'tometo and poteto and onien'
    const start = performance.now()
    const results = matchProducts(query, products)
    const duration = performance.now() - start
    console.log(`Performance: Typo query took ${duration.toFixed(2)}ms for 180 products`)
    expect(duration).toBeLessThan(100)
  })
})