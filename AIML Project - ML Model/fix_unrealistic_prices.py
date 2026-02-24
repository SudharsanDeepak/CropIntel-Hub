"""
Fix Unrealistic Prices in MongoDB
This script corrects any products with unrealistic prices (>₹1000/kg for common items)
"""
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Realistic price ranges for Indian market (₹/kg)
REALISTIC_PRICE_RANGES = {
    # Common Vegetables (₹20-100/kg)
    'Onion': (25, 60),
    'Red Onion': (25, 60),
    'White Onion': (30, 65),
    'Yellow Onion': (25, 60),
    'Pearl Onion': (40, 80),
    'Potato': (25, 45),
    'Red Potato': (30, 50),
    'White Potato': (25, 45),
    'Yellow Potato': (28, 48),
    'Russet Potato': (35, 60),
    'Tomato': (30, 80),
    'Cherry Tomato': (80, 150),
    'Carrot': (40, 75),
    'Cabbage': (25, 50),
    'Cauliflower': (40, 80),
    'Brinjal': (40, 75),
    'Cucumber': (30, 60),
    'Radish': (30, 60),
    'White Radish': (30, 60),
    'Black Radish': (35, 65),
    'Red Radish': (30, 60),
    'Daikon': (35, 65),
    'Beetroot': (45, 80),
    'Pumpkin': (25, 50),
    'Spinach': (25, 50),
    'Lady Finger': (45, 90),
    
    # Leafy Vegetables (₹20-80/kg)
    'Coriander Leaves': (40, 80),
    'Mint Leaves': (50, 100),
    'Curry Leaves': (60, 120),
    'Fenugreek Leaves': (30, 65),
    'Amaranth Leaves': (25, 55),
    'Mustard Greens': (25, 55),
    'Kale': (80, 150),
    
    # Gourds (₹25-80/kg)
    'Bottle Gourd': (30, 60),
    'Ridge Gourd': (40, 70),
    'Bitter Gourd': (45, 80),
    'Snake Gourd': (40, 70),
    'Ash Gourd': (25, 50),
    'Sponge Gourd': (35, 70),
    'Ivy Gourd': (40, 75),
    'Pointed Gourd': (40, 75),
    
    # Beans & Peas (₹50-130/kg)
    'French Beans': (60, 110),
    'Cluster Beans': (50, 95),
    'Broad Beans': (80, 130),
    'Green Peas': (60, 120),
    'Green Beans': (55, 105),
    
    # Premium Vegetables (₹80-350/kg)
    'Capsicum': (80, 150),
    'Green Chilli': (50, 120),
    'Garlic': (100, 180),
    'Ginger': (80, 150),
    'Broccoli': (100, 180),
    'Mushroom': (200, 350),
    'Baby Corn': (120, 220),
    'Lettuce': (80, 150),
    'Zucchini': (90, 160),
    
    # Common Fruits (₹30-100/kg)
    'Banana': (50, 80),
    'Papaya': (40, 70),
    'Watermelon': (25, 50),
    'Muskmelon': (40, 70),
    'Guava': (50, 80),
    'Sapota': (50, 90),
    'Coconut': (40, 70),
    'Sweet Lime': (50, 90),
    
    # Mid-Range Fruits (₹80-200/kg)
    'Apple': (140, 220),
    'Mango': (80, 180),
    'Orange': (60, 100),
    'Pineapple': (50, 90),
    'Grapes': (80, 160),
    'Custard Apple': (80, 140),
    'Jackfruit': (40, 80),
    'Pear': (120, 200),
    'Star Fruit': (100, 180),
    
    # Premium Fruits (₹150-600/kg)
    'Pomegranate': (150, 280),
    'Lychee': (150, 250),
    'Strawberry': (300, 500),
    'Peach': (150, 250),
    'Plum': (180, 280),
    'Apricot': (200, 350),
    'Kiwi': (250, 400),
    'Dragon Fruit': (200, 350),
    'Passion Fruit': (250, 400),
    'Fig': (400, 600),
    'Dates': (350, 550),
    'Avocado': (350, 550),
    'Persimmon': (200, 320),
    
    # Imported/Exotic Fruits (₹400-1000/kg)
    'Blueberry': (600, 1000),
    'Blackberry': (400, 700),
    'Cherry': (500, 800),
    'Rambutan': (250, 400),
}

def fix_prices():
    """Fix unrealistic prices in the database"""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    db = client["market_analyzer"]
    collection = db["sales"]
    
    print("\n" + "=" * 70)
    print("🔧 FIXING UNREALISTIC PRICES")
    print("=" * 70)
    
    # Find all products with unrealistic prices
    unrealistic_products = collection.find({
        "$or": [
            {"price": {"$gt": 1000}},  # More than ₹1000/kg
            {"price": {"$lt": 10}}      # Less than ₹10/kg
        ]
    })
    
    fixed_count = 0
    products_fixed = set()
    
    for record in unrealistic_products:
        product_name = record['product']
        old_price = record['price']
        
        # Get realistic price range
        if product_name in REALISTIC_PRICE_RANGES:
            min_price, max_price = REALISTIC_PRICE_RANGES[product_name]
        else:
            # Default range for unknown products
            category = record.get('category', 'vegetable')
            if category == 'fruit':
                min_price, max_price = (60, 150)
            else:
                min_price, max_price = (30, 80)
        
        # Calculate new realistic price (use middle of range)
        new_price = (min_price + max_price) / 2
        
        # Update the record
        collection.update_one(
            {"_id": record['_id']},
            {"$set": {"price": round(new_price, 2)}}
        )
        
        products_fixed.add(product_name)
        fixed_count += 1
        
        if old_price > 1000:
            print(f"   ⚠️  {product_name}: ₹{old_price:.2f} → ₹{new_price:.2f}/kg")
    
    print(f"\n✅ Fixed {fixed_count} records")
    print(f"📦 Products corrected: {len(products_fixed)}")
    
    if products_fixed:
        print("\n🔧 Products Fixed:")
        print("-" * 70)
        for product in sorted(products_fixed):
            if product in REALISTIC_PRICE_RANGES:
                min_p, max_p = REALISTIC_PRICE_RANGES[product]
                print(f"   {product}: ₹{min_p}-₹{max_p}/kg")
    
    # Add missing products with realistic prices
    print("\n📝 Checking for missing products...")
    existing_products = collection.distinct("product")
    missing_products = set(REALISTIC_PRICE_RANGES.keys()) - set(existing_products)
    
    if missing_products:
        print(f"   Found {len(missing_products)} missing products")
        from datetime import timedelta
        import random
        
        records = []
        current_date = datetime.now()
        
        for product_name in missing_products:
            min_price, max_price = REALISTIC_PRICE_RANGES[product_name]
            category = 'fruit' if any(x in product_name.lower() for x in ['apple', 'mango', 'berry', 'fruit']) else 'vegetable'
            
            for days_ago in range(30):
                date = current_date - timedelta(days=days_ago)
                base_price = (min_price + max_price) / 2
                daily_variation = random.uniform(-0.1, 0.1)
                price = base_price * (1 + daily_variation)
                
                record = {
                    'date': date,
                    'product': product_name,
                    'category': category,
                    'price': round(price, 2),
                    'unit': 'kg',
                    'quantity': random.randint(80, 150),
                    'stock': random.randint(80, 150),
                    'temperature': random.randint(15, 35),
                    'rainfall': random.randint(0, 50),
                    'source': 'corrected',
                    'confidence': 'high'
                }
                records.append(record)
        
        if records:
            collection.insert_many(records)
            print(f"   ✅ Added {len(records)} records for missing products")
    
    print("\n" + "=" * 70)
    print("✅ PRICE CORRECTION COMPLETE")
    print("=" * 70)
    
    # Show summary statistics
    print("\n📊 CURRENT PRICE STATISTICS:")
    print("-" * 70)
    
    pipeline = [
        {"$group": {
            "_id": "$product",
            "avg_price": {"$avg": "$price"},
            "min_price": {"$min": "$price"},
            "max_price": {"$max": "$price"}
        }},
        {"$sort": {"avg_price": -1}},
        {"$limit": 10}
    ]
    
    print("\n🔝 Top 10 Most Expensive Products:")
    for doc in collection.aggregate(pipeline):
        print(f"   {doc['_id']}: ₹{doc['avg_price']:.2f}/kg (₹{doc['min_price']:.2f}-₹{doc['max_price']:.2f})")
    
    client.close()

if __name__ == "__main__":
    fix_prices()
