"""
Quick script to populate MongoDB with realistic market data.
Includes 50 common products with proper Indian market prices.
"""
import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

load_dotenv()

# Realistic products with proper price ranges (₹/kg)
PRODUCTS_WITH_PRICES = {
    # Vegetables (₹20-150/kg)
    'Tomato': (30, 80),
    'Potato': (25, 45),
    'Onion': (25, 60),
    'Red Onion': (25, 60),
    'Carrot': (40, 75),
    'Cabbage': (25, 50),
    'Cauliflower': (40, 80),
    'Brinjal': (40, 75),
    'Capsicum': (80, 150),
    'Green Chilli': (50, 120),
    'Cucumber': (30, 60),
    'Radish': (30, 60),
    'Beetroot': (45, 80),
    'Pumpkin': (25, 50),
    'Spinach': (25, 50),
    'Lady Finger': (45, 90),
    'Bottle Gourd': (30, 60),
    'Ridge Gourd': (40, 70),
    'Bitter Gourd': (45, 80),
    'French Beans': (60, 110),
    'Green Peas': (60, 120),
    'Garlic': (100, 180),
    'Ginger': (80, 150),
    'Coriander Leaves': (40, 80),
    'Mint Leaves': (50, 100),
    
    # Fruits (₹30-500/kg)
    'Apple': (140, 220),
    'Banana': (50, 80),
    'Mango': (80, 180),
    'Orange': (60, 100),
    'Papaya': (40, 70),
    'Pineapple': (50, 90),
    'Guava': (50, 80),
    'Watermelon': (25, 50),
    'Muskmelon': (40, 70),
    'Pomegranate': (150, 280),
    'Grapes': (80, 160),
    'Sapota': (50, 90),
    'Custard Apple': (80, 140),
    'Jackfruit': (40, 80),
    'Lychee': (150, 250),
    'Strawberry': (300, 500),
    'Pear': (120, 200),
    'Peach': (150, 250),
    'Kiwi': (250, 400),
    'Dragon Fruit': (200, 350),
    'Coconut': (40, 70),
    'Sweet Lime': (50, 90),
}

def create_sample_data():
    """Create realistic market data for 50 products"""
    records = []
    start_date = datetime.now() - timedelta(days=30)
    
    for day in range(30):
        current_date = start_date + timedelta(days=day)
        
        for product, (min_price, max_price) in PRODUCTS_WITH_PRICES.items():
            # Determine category
            category = 'fruit' if product in ['Apple', 'Banana', 'Mango', 'Orange', 'Papaya', 
                                               'Pineapple', 'Guava', 'Watermelon', 'Muskmelon',
                                               'Pomegranate', 'Grapes', 'Sapota', 'Custard Apple',
                                               'Jackfruit', 'Lychee', 'Strawberry', 'Pear', 'Peach',
                                               'Kiwi', 'Dragon Fruit', 'Coconut', 'Sweet Lime'] else 'vegetable'
            
            # Generate realistic price with daily variation
            base_price = (min_price + max_price) / 2
            daily_variation = random.uniform(-0.15, 0.15)  # ±15% daily variation
            price = base_price * (1 + daily_variation)
            price = max(min_price, min(max_price, price))  # Clamp to range
            
            # Generate demand (higher for cheaper items)
            base_demand = 150 - (price / 10)  # Inverse relationship
            demand = max(50, base_demand + random.uniform(-30, 30))
            
            records.append({
                "date": current_date,
                "product": product,
                "category": category,
                "quantity": round(demand, 1),
                "predicted_demand": round(demand, 1),
                "price": round(price, 2),
                "stock": random.randint(80, 200),
                "temperature": random.uniform(20, 35),
                "rainfall": random.uniform(0, 15),
                "unit": "kg",
                "source": "realistic_data",
                "confidence": "high"
            })
    
    return records
def main():
    print("\n" + "=" * 70)
    print("🚀 QUICK DATABASE POPULATION - REALISTIC PRICES")
    print("=" * 70)
    
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    
    try:
        print("\n🔄 Connecting to MongoDB...")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
        db = client["market_analyzer"]
        collection = db["sales"]
        print("✅ Connected successfully")
        
        print("\n🗑️  Clearing existing data...")
        collection.delete_many({})
        print("✅ Cleared")
        
        print("\n📊 Creating realistic market data...")
        records = create_sample_data()
        print(f"✅ Created {len(records)} records")
        print(f"   Products: {len(PRODUCTS_WITH_PRICES)}")
        print(f"   Days of history: 30")
        
        print("\n💾 Inserting into MongoDB...")
        result = collection.insert_many(records)
        print(f"✅ Inserted {len(result.inserted_ids)} records")
        
        print("\n📈 Verification:")
        count = collection.count_documents({})
        products = collection.distinct("product")
        
        # Calculate average price
        pipeline = [
            {"$group": {
                "_id": None,
                "avg_price": {"$avg": "$price"},
                "min_price": {"$min": "$price"},
                "max_price": {"$max": "$price"}
            }}
        ]
        stats = list(collection.aggregate(pipeline))[0]
        
        print(f"   Total records: {count}")
        print(f"   Total products: {len(products)}")
        print(f"   Avg price: ₹{stats['avg_price']:.2f}/kg")
        print(f"   Price range: ₹{stats['min_price']:.2f} - ₹{stats['max_price']:.2f}/kg")
        
        print("\n💰 Sample Prices (Current):")
        print("-" * 70)
        sample_products = ['Tomato', 'Potato', 'Onion', 'Red Onion', 'Apple', 
                          'Banana', 'Strawberry', 'Capsicum']
        for product in sample_products:
            if product in PRODUCTS_WITH_PRICES:
                min_p, max_p = PRODUCTS_WITH_PRICES[product]
                avg_p = (min_p + max_p) / 2
                print(f"   {product:20s}: ₹{avg_p:6.2f}/kg  (Range: ₹{min_p}-₹{max_p})")
        
        print("\n" + "=" * 70)
        print("✅ DATABASE POPULATED SUCCESSFULLY WITH REALISTIC PRICES!")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Refresh your browser to see updated prices")
        print("2. Check Dashboard - Avg Price should be around ₹80-100/kg")
        print("3. Verify products have realistic prices")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n💡 Troubleshooting:")
        print("   - Check MONGO_URI in .env")
        print("   - Verify internet connection")
        print("   - Check MongoDB Atlas IP whitelist")
        print(f"\n   Error details: {type(e).__name__}")

if __name__ == "__main__":
    main()