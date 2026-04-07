#!/usr/bin/env python3
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client['market_analyzer']
collection = db['sales']

print('🔍 Verifying MongoDB Price Data...\n')

# Get sample products with their prices
sample = collection.find().limit(30)
products = {}
for doc in sample:
    product = doc['product']
    price = doc['price']
    if product not in products:
        products[product] = []
    products[product].append(price)

print('📊 Sample Products with Prices:')
print('=' * 60)
for product, prices in sorted(products.items()):
    avg_price = sum(prices) / len(prices)
    min_price = min(prices)
    max_price = max(prices)
    print(f'{product:20} | Avg: ₹{avg_price:7.2f} | Range: ₹{min_price:7.2f}-₹{max_price:7.2f}')

# Get total stats
total_docs = collection.count_documents({})
pipeline = [
    {'$group': {
        '_id': None,
        'avgPrice': {'$avg': '$price'},
        'minPrice': {'$min': '$price'},
        'maxPrice': {'$max': '$price'},
        'uniqueProducts': {'$addToSet': '$product'}
    }}
]
stats = list(collection.aggregate(pipeline))[0]

print('\n' + '=' * 60)
print('📈 Overall Statistics:')
print(f'Total Records: {total_docs}')
print(f'Unique Products: {len(stats["uniqueProducts"])}')
print(f'Average Price: ₹{stats["avgPrice"]:.2f}/kg')
print(f'Min Price: ₹{stats["minPrice"]:.2f}/kg')
print(f'Max Price: ₹{stats["maxPrice"]:.2f}/kg')

print('\n✅ Data verification complete!')
