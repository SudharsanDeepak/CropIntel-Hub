export const mockProducts = [
  {
    product: 'Tomato',
    price: 45.50,
    category: 'vegetable',
    predicted_demand: 1250,
    stock: 150
  },
  {
    product: 'Potato',
    price: 32.00,
    category: 'vegetable',
    predicted_demand: 2100,
    stock: 300
  },
  {
    product: 'Onion',
    price: 28.75,
    category: 'vegetable',
    predicted_demand: 1800,
    stock: 250
  },
  {
    product: 'Carrot',
    price: 38.00,
    category: 'vegetable',
    predicted_demand: 950,
    stock: 120
  },
  {
    product: 'Cabbage',
    price: 25.50,
    category: 'vegetable',
    predicted_demand: 780,
    stock: 90
  },
  {
    product: 'Cauliflower',
    price: 42.00,
    category: 'vegetable',
    predicted_demand: 850,
    stock: 100
  },
  {
    product: 'Broccoli',
    price: 65.00,
    category: 'vegetable',
    predicted_demand: 450,
    stock: 60
  },
  {
    product: 'Spinach',
    price: 35.00,
    category: 'vegetable',
    predicted_demand: 680,
    stock: 85
  },
  {
    product: 'Cucumber',
    price: 30.00,
    category: 'vegetable',
    predicted_demand: 920,
    stock: 110
  },
  {
    product: 'Bell Pepper',
    price: 55.00,
    category: 'vegetable',
    predicted_demand: 520,
    stock: 70
  },
  {
    product: 'Apple',
    price: 120.00,
    category: 'fruit',
    predicted_demand: 1500,
    stock: 200
  },
  {
    product: 'Banana',
    price: 48.00,
    category: 'fruit',
    predicted_demand: 2200,
    stock: 350
  },
  {
    product: 'Orange',
    price: 75.00,
    category: 'fruit',
    predicted_demand: 1100,
    stock: 150
  },
  {
    product: 'Mango',
    price: 95.00,
    category: 'fruit',
    predicted_demand: 1350,
    stock: 180
  },
  {
    product: 'Grapes',
    price: 85.00,
    category: 'fruit',
    predicted_demand: 890,
    stock: 120
  },
  {
    product: 'Watermelon',
    price: 35.00,
    category: 'fruit',
    predicted_demand: 1650,
    stock: 220
  },
  {
    product: 'Pineapple',
    price: 60.00,
    category: 'fruit',
    predicted_demand: 720,
    stock: 95
  },
  {
    product: 'Strawberry',
    price: 180.00,
    category: 'fruit',
    predicted_demand: 420,
    stock: 55
  },
  {
    product: 'Papaya',
    price: 45.00,
    category: 'fruit',
    predicted_demand: 650,
    stock: 85
  },
  {
    product: 'Pomegranate',
    price: 110.00,
    category: 'fruit',
    predicted_demand: 580,
    stock: 75
  }
]
export const mockConversationHistory = [
  {
    role: 'user',
    content: 'What is the price of tomato?',
    timestamp: new Date('2024-01-15T10:00:00'),
    metadata: {
      products: ['Tomato'],
      intent: 'price_check'
    }
  },
  {
    role: 'assistant',
    content: '**Tomato** is currently priced at **₹45.50/kg** 🍅',
    timestamp: new Date('2024-01-15T10:00:01'),
    metadata: {
      products: ['Tomato']
    }
  },
  {
    role: 'user',
    content: 'Compare potato and onion',
    timestamp: new Date('2024-01-15T10:01:00'),
    metadata: {
      products: ['Potato', 'Onion'],
      intent: 'comparison'
    }
  },
  {
    role: 'assistant',
    content: 'Here\'s a comparison:\n1. **Potato**: ₹32.00/kg\n2. **Onion**: ₹28.75/kg\n\nOnion is cheaper by ₹3.25/kg! 🥔🧅',
    timestamp: new Date('2024-01-15T10:01:02'),
    metadata: {
      products: ['Potato', 'Onion']
    }
  }
]
export const mockQueries = {
  priceCheck: [
    'What is the price of tomato?',
    'How much does potato cost?',
    'Tell me the price of apple',
    'Price of banana'
  ],
  comparison: [
    'Compare tomato and potato',
    'Difference between apple and orange',
    'Tomato vs potato prices',
    'Which is cheaper: onion or carrot?'
  ],
  recommendation: [
    'Suggest cheap vegetables',
    'What are the best seasonal fruits?',
    'Recommend fresh produce',
    'Show me affordable options'
  ],
  bestDeals: [
    'What are the cheapest products?',
    'Show me best deals',
    'Which products are on sale?',
    'Find me the most affordable items'
  ],
  categoryList: [
    'List all vegetables',
    'Show me fruits',
    'What vegetables do you have?',
    'Display all fruit options'
  ],
  forecast: [
    'What will be the price tomorrow?',
    'Predict future prices',
    'Price forecast for next week',
    'Expected price trends'
  ],
  alertSetup: [
    'Set an alert for tomato',
    'Notify me when price drops',
    'Alert me about potato prices',
    'Set up price notification'
  ],
  help: [
    'Help',
    'What can you do?',
    'How does this work?',
    'Show me features'
  ]
}
export const mockParsedQueries = {
  simple: {
    intent: 'price_check',
    entities: {
      products: ['Tomato'],
      categories: [],
      priceRange: { min: null, max: null },
      temporal: { type: null, date: null }
    },
    isComparison: false,
    isMultiProduct: false,
    confidence: 0.95
  },
  multiProduct: {
    intent: 'comparison',
    entities: {
      products: ['Tomato', 'Potato'],
      categories: [],
      priceRange: { min: null, max: null },
      temporal: { type: null, date: null }
    },
    isComparison: true,
    isMultiProduct: true,
    confidence: 0.92
  },
  recommendation: {
    intent: 'recommendation',
    entities: {
      products: [],
      categories: ['vegetable'],
      priceRange: { min: null, max: 50 },
      temporal: { type: null, date: null }
    },
    isComparison: false,
    isMultiProduct: false,
    confidence: 0.88
  }
}