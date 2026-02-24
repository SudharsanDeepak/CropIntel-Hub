"""
Quick Population Script for 180 Products
Generates realistic market data for all fruits and vegetables
"""
from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv
load_dotenv()
def populate_database():
    """Populate database with 180 products with realistic prices"""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    db = client["market_analyzer"]
    collection = db["sales"]
    products_data = {
        'Apple': {'category': 'fruit', 'price_range': (140, 220), 'seasonal': False},  # Royal Gala, Fuji varieties
        'Banana': {'category': 'fruit', 'price_range': (50, 80), 'seasonal': False},
        'Mango': {'category': 'fruit', 'price_range': (80, 180), 'seasonal': True},  # Alphonso, Kesar premium
        'Orange': {'category': 'fruit', 'price_range': (60, 100), 'seasonal': True},
        'Papaya': {'category': 'fruit', 'price_range': (40, 70), 'seasonal': False},
        'Pineapple': {'category': 'fruit', 'price_range': (50, 90), 'seasonal': False},
        'Guava': {'category': 'fruit', 'price_range': (50, 80), 'seasonal': True},
        'Watermelon': {'category': 'fruit', 'price_range': (25, 50), 'seasonal': True},
        'Muskmelon': {'category': 'fruit', 'price_range': (40, 70), 'seasonal': True},
        'Pomegranate': {'category': 'fruit', 'price_range': (150, 280), 'seasonal': False},  # Premium quality
        'Grapes': {'category': 'fruit', 'price_range': (80, 160), 'seasonal': True},  # Green/Black varieties
        'Sapota': {'category': 'fruit', 'price_range': (50, 90), 'seasonal': False},
        'Custard Apple': {'category': 'fruit', 'price_range': (80, 140), 'seasonal': True},
        'Jackfruit': {'category': 'fruit', 'price_range': (40, 80), 'seasonal': True},
        'Lychee': {'category': 'fruit', 'price_range': (150, 250), 'seasonal': True},
        'Strawberry': {'category': 'fruit', 'price_range': (300, 500), 'seasonal': True},  # Premium fresh
        'Blueberry': {'category': 'fruit', 'price_range': (600, 1000), 'seasonal': False},  # Imported
        'Blackberry': {'category': 'fruit', 'price_range': (400, 700), 'seasonal': True},
        'Pear': {'category': 'fruit', 'price_range': (120, 200), 'seasonal': True},
        'Peach': {'category': 'fruit', 'price_range': (150, 250), 'seasonal': True},
        'Plum': {'category': 'fruit', 'price_range': (180, 280), 'seasonal': True},
        'Apricot': {'category': 'fruit', 'price_range': (200, 350), 'seasonal': True},
        'Kiwi': {'category': 'fruit', 'price_range': (250, 400), 'seasonal': False},  # Imported
        'Dragon Fruit': {'category': 'fruit', 'price_range': (200, 350), 'seasonal': False},
        'Passion Fruit': {'category': 'fruit', 'price_range': (250, 400), 'seasonal': True},
        'Fig': {'category': 'fruit', 'price_range': (400, 600), 'seasonal': True},
        'Dates': {'category': 'fruit', 'price_range': (350, 550), 'seasonal': False},
        'Coconut': {'category': 'fruit', 'price_range': (40, 70), 'seasonal': False},
        'Tender Coconut': {'category': 'fruit', 'price_range': (50, 80), 'seasonal': False},
        'Sweet Lime': {'category': 'fruit', 'price_range': (50, 90), 'seasonal': True},
        'Amla': {'category': 'fruit', 'price_range': (50, 100), 'seasonal': True},
        'Jamun': {'category': 'fruit', 'price_range': (80, 140), 'seasonal': True},
        'Karonda': {'category': 'fruit', 'price_range': (60, 110), 'seasonal': True},
        'Wood Apple': {'category': 'fruit', 'price_range': (50, 90), 'seasonal': True},
        'Star Fruit': {'category': 'fruit', 'price_range': (100, 180), 'seasonal': True},
        'Mulberry': {'category': 'fruit', 'price_range': (150, 250), 'seasonal': True},
        'Rambutan': {'category': 'fruit', 'price_range': (250, 400), 'seasonal': True},
        'Avocado': {'category': 'fruit', 'price_range': (350, 550), 'seasonal': False},  # Premium imported
        'Persimmon': {'category': 'fruit', 'price_range': (200, 320), 'seasonal': True},
        'Cherry': {'category': 'fruit', 'price_range': (500, 800), 'seasonal': True},  # Imported
        'Potato': {'category': 'vegetable', 'price_range': (25, 45), 'seasonal': False},
        'Tomato': {'category': 'vegetable', 'price_range': (30, 80), 'seasonal': False},  # High volatility
        'Onion': {'category': 'vegetable', 'price_range': (25, 60), 'seasonal': False},  # High volatility
        'Red Onion': {'category': 'vegetable', 'price_range': (25, 60), 'seasonal': False},
        'White Onion': {'category': 'vegetable', 'price_range': (30, 65), 'seasonal': False},
        'Yellow Onion': {'category': 'vegetable', 'price_range': (25, 60), 'seasonal': False},
        'Garlic': {'category': 'vegetable', 'price_range': (100, 180), 'seasonal': False},
        'Ginger': {'category': 'vegetable', 'price_range': (80, 150), 'seasonal': False},
        'Carrot': {'category': 'vegetable', 'price_range': (40, 75), 'seasonal': False},
        'Cabbage': {'category': 'vegetable', 'price_range': (25, 50), 'seasonal': False},
        'Cauliflower': {'category': 'vegetable', 'price_range': (40, 80), 'seasonal': True},
        'Brinjal': {'category': 'vegetable', 'price_range': (40, 75), 'seasonal': False},
        'Capsicum': {'category': 'vegetable', 'price_range': (80, 150), 'seasonal': False},  # Green variety
        'Green Chilli': {'category': 'vegetable', 'price_range': (50, 120), 'seasonal': False},
        'Cucumber': {'category': 'vegetable', 'price_range': (30, 60), 'seasonal': False},
        'Bottle Gourd': {'category': 'vegetable', 'price_range': (30, 60), 'seasonal': False},
        'Ridge Gourd': {'category': 'vegetable', 'price_range': (40, 70), 'seasonal': False},
        'Bitter Gourd': {'category': 'vegetable', 'price_range': (45, 80), 'seasonal': False},
        'Snake Gourd': {'category': 'vegetable', 'price_range': (40, 70), 'seasonal': False},
        'Ash Gourd': {'category': 'vegetable', 'price_range': (25, 50), 'seasonal': False},
        'Pumpkin': {'category': 'vegetable', 'price_range': (25, 50), 'seasonal': False},
        'Radish': {'category': 'vegetable', 'price_range': (30, 60), 'seasonal': True},
        'Turnip': {'category': 'vegetable', 'price_range': (40, 70), 'seasonal': True},
        'Beetroot': {'category': 'vegetable', 'price_range': (45, 80), 'seasonal': False},
        'Drumstick': {'category': 'vegetable', 'price_range': (50, 100), 'seasonal': True},
        'Cluster Beans': {'category': 'vegetable', 'price_range': (50, 95), 'seasonal': True},
        'French Beans': {'category': 'vegetable', 'price_range': (60, 110), 'seasonal': False},
        'Broad Beans': {'category': 'vegetable', 'price_range': (80, 130), 'seasonal': True},
        'Green Peas': {'category': 'vegetable', 'price_range': (60, 120), 'seasonal': True},
        'Chow Chow': {'category': 'vegetable', 'price_range': (40, 70), 'seasonal': False},
        'Raw Banana': {'category': 'vegetable', 'price_range': (30, 60), 'seasonal': False},
        'Taro Root': {'category': 'vegetable', 'price_range': (45, 80), 'seasonal': False},
        'Sweet Potato': {'category': 'vegetable', 'price_range': (40, 75), 'seasonal': False},
        'Yam': {'category': 'vegetable', 'price_range': (50, 95), 'seasonal': False},
        'Spinach': {'category': 'vegetable', 'price_range': (25, 50), 'seasonal': False},
        'Fenugreek Leaves': {'category': 'vegetable', 'price_range': (30, 65), 'seasonal': True},
        'Coriander Leaves': {'category': 'vegetable', 'price_range': (40, 80), 'seasonal': False},
        'Mint Leaves': {'category': 'vegetable', 'price_range': (50, 100), 'seasonal': False},
        'Curry Leaves': {'category': 'vegetable', 'price_range': (60, 120), 'seasonal': False},
        'Spring Onion': {'category': 'vegetable', 'price_range': (50, 95), 'seasonal': False},
        'Lettuce': {'category': 'vegetable', 'price_range': (80, 150), 'seasonal': False},
        'Broccoli': {'category': 'vegetable', 'price_range': (100, 180), 'seasonal': False},  # Premium
        'Zucchini': {'category': 'vegetable', 'price_range': (90, 160), 'seasonal': False},
        'Mushroom': {'category': 'vegetable', 'price_range': (200, 350), 'seasonal': False},  # Button mushroom
        'Corn': {'category': 'vegetable', 'price_range': (40, 80), 'seasonal': True},
        'Baby Corn': {'category': 'vegetable', 'price_range': (120, 220), 'seasonal': False},
        'Lady Finger': {'category': 'vegetable', 'price_range': (45, 90), 'seasonal': False},
        'Brussels Sprouts': {'category': 'vegetable', 'price_range': (150, 280), 'seasonal': True},
    }
    remaining_fruits = [
        'Mandarin', 'Tamarind', 'Palm Fruit', 'Ber', 'Rose Apple', 'Sugarcane',
        'Grapefruit', 'Cranberry', 'Longan', 'Durian', 'Olives', 'Soursop',
        'Mangosteen', 'Gooseberry', 'Custard Pear', 'Indian Fig', 'Quince',
        'Breadfruit', 'Kumquat', 'Cantaloupe', 'Honeydew Melon', 'Nectarine',
        'Pomelo', 'Red Banana', 'Plantain', 'Kinnow', 'Langsat', 'Loquat',
        'Miracle Fruit', 'Snake Fruit', 'Indian Blackberry', 'Indian Plum',
        'Indian Almond Fruit', 'Bilimbi', 'Ceylon Gooseberry', 'Malay Apple',
        'Indian Mulberry', 'Santol', 'Sapodilla', 'Indian Persimmon',
        'Wild Mango', 'Hog Plum', 'Indian Bael Fruit', 'Elephant Apple',
        'Phalsa', 'Indian Cherry', 'Tadgola', 'Water Apple', 'Indian Fig Fruit',
        'Gunda Fruit'
    ]
    for fruit in remaining_fruits:
        if fruit in ['Durian', 'Mangosteen', 'Soursop', 'Miracle Fruit']:
            products_data[fruit] = {'category': 'fruit', 'price_range': (300, 500), 'seasonal': True}
        elif fruit in ['Cranberry', 'Longan', 'Loquat', 'Kumquat', 'Nectarine']:
            products_data[fruit] = {'category': 'fruit', 'price_range': (200, 350), 'seasonal': True}
        elif fruit in ['Cantaloupe', 'Honeydew Melon', 'Pomelo', 'Grapefruit']:
            products_data[fruit] = {'category': 'fruit', 'price_range': (60, 120), 'seasonal': True}
        else:
            products_data[fruit] = {'category': 'fruit', 'price_range': (70, 150), 'seasonal': True}
    remaining_vegetables = [
        'Colocasia Leaves', 'Amaranth Leaves', 'Ivy Gourd', 'Pointed Gourd',
        'Sponge Gourd', 'Knol Khol', 'Raw Papaya', 'Raw Mango', 'Green Gram Sprouts',
        'Black Gram Sprouts', 'Chickpeas', 'Horse Gram', 'Field Beans',
        'Drumstick Leaves', 'Red Cabbage', 'Yellow Capsicum', 'Red Capsicum',
        'Green Beans', 'Celery', 'Leek', 'Parsley', 'Basil', 'Dill Leaves',
        'Mustard Greens', 'Turnip Greens', 'Radish Leaves', 'Kale', 'Bok Choy',
        'Arugula', 'Water Spinach', 'Malabar Spinach', 'Shepu', 'Sorrel Leaves',
        'Ridge Gourd Leaves', 'Pumpkin Leaves', 'Banana Flower', 'Banana Stem',
        'Lotus Root', 'Green Garlic', 'Pearl Onion', 'Shallots', 'White Radish',
        'Purple Cabbage', 'Raw Jackfruit', 'Green Soybeans'
    ]
    for veg in remaining_vegetables:
        if veg in ['Yellow Capsicum', 'Red Capsicum', 'Kale', 'Arugula', 'Celery', 'Leek', 'Parsley', 'Basil']:
            products_data[veg] = {'category': 'vegetable', 'price_range': (80, 150), 'seasonal': False}
        elif veg in ['Lotus Root', 'Banana Flower']:
            products_data[veg] = {'category': 'vegetable', 'price_range': (60, 110), 'seasonal': False}
        elif 'Leaves' in veg or 'Greens' in veg:
            products_data[veg] = {'category': 'vegetable', 'price_range': (25, 60), 'seasonal': False}
        else:
            products_data[veg] = {'category': 'vegetable', 'price_range': (35, 80), 'seasonal': False}
    records = []
    current_date = datetime.now()
    print("\n" + "=" * 70)
    print("🌾 POPULATING DATABASE WITH 180 PRODUCTS")
    print("=" * 70)
    for product_name, data in products_data.items():
        for days_ago in range(30):
            date = current_date - timedelta(days=days_ago)
            min_price, max_price = data['price_range']
            base_price = random.uniform(min_price, max_price)
            daily_variation = random.uniform(-0.1, 0.1)
            price = base_price * (1 + daily_variation)
            base_quantity = random.randint(80, 150)
            quantity = base_quantity + random.randint(-20, 20)
            record = {
                'date': date,
                'product': product_name,
                'category': data['category'],
                'price': round(price, 2),
                'unit': 'kg',
                'quantity': quantity,
                'stock': quantity,
                'temperature': random.randint(15, 35),
                'rainfall': random.randint(0, 50),
                'source': 'generated',
                'confidence': 'high',
                'seasonal': data['seasonal']
            }
            records.append(record)
    collection.delete_many({})
    print(f"🗑️  Cleared existing data")
    result = collection.insert_many(records)
    print(f"✅ Inserted {len(result.inserted_ids)} records")
    print(f"📦 Products: {len(products_data)}")
    print(f"📅 Days of history: 30")
    print(f"💾 Database: market_analyzer.sales")
    print("\n📊 SUMMARY:")
    print("-" * 70)
    print(f"Total Fruits: {sum(1 for d in products_data.values() if d['category'] == 'fruit')}")
    print(f"Total Vegetables: {sum(1 for d in products_data.values() if d['category'] == 'vegetable')}")
    print(f"Total Records: {len(records)}")
    print("\n🏆 SAMPLE PRICES (Today):")
    print("-" * 70)
    sample_products = ['Apple', 'Banana', 'Tomato', 'Potato', 'Onion', 'Mushroom', 'Avocado', 'Strawberry']
    for product in sample_products:
        if product in products_data:
            min_p, max_p = products_data[product]['price_range']
            avg_p = (min_p + max_p) / 2
            print(f"   {product}: ₹{avg_p:.2f}/kg")
    print("\n" + "=" * 70)
    print("✅ DATABASE POPULATION COMPLETE")
    print("=" * 70)
    client.close()
if __name__ == "__main__":
    populate_database()