"""
EMERGENCY PRICE FIX
This script fixes unrealistic prices in MongoDB immediately
and provides realistic fallback data for the ML API
"""
from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv

load_dotenv()

# Realistic price ranges (₹/kg) - Indian Market
REALISTIC_PRICES = {
    # Common Vegetables (₹20-100)
    'Tomato': 55, 'Potato': 35, 'Onion': 42, 'Red Onion': 42, 'White Onion': 45,
    'Carrot': 57, 'Cabbage': 37, 'Cauliflower': 60, 'Brinjal': 57, 'Cucumber': 45,
    'Radish': 45, 'Beetroot': 62, 'Pumpkin': 37, 'Spinach': 37, 'Lady Finger': 67,
    'Bottle Gourd': 45, 'Ridge Gourd': 55, 'Bitter Gourd': 62, 'French Beans': 85,
    'Green Peas': 90, 'Coriander Leaves': 60, 'Mint Leaves': 75,
    
    # Premium Vegetables (₹80-200)
    'Capsicum': 115, 'Green Chilli': 85, 'Garlic': 140, 'Ginger': 115,
    'Broccoli': 140, 'Mushroom': 275, 'Baby Corn': 170, 'Lettuce': 115,
    
    # Common Fruits (₹30-100)
    'Banana': 65, 'Papaya': 55, 'Watermelon': 37, 'Muskmelon': 55,
    'Guava': 65, 'Sapota': 70, 'Coconut': 55, 'Sweet Lime': 70,
    
    # Mid-Range Fruits (₹80-200)
    'Apple': 180, 'Mango': 130, 'Orange': 80, 'Pineapple': 70,
    'Grapes': 120, 'Custard Apple': 110, 'Jackfruit': 60, 'Pear': 160,
    
    # Premium Fruits (₹150-500)
    'Pomegranate': 215, 'Lychee': 200, 'Strawberry': 400, 'Peach': 200,
    'Kiwi': 325, 'Dragon Fruit': 275, 'Avocado': 450,
}

def fix_database():
    """Fix all prices in MongoDB"""
    print("\n" + "=" * 70)
    print("🚨 EMERGENCY PRICE FIX - RUNNING NOW")
    print("=" * 70)
    
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("❌ ERROR: MONGO_URI not found in .env file")
        return False
    
    try:
        print("\n🔄 Connecting to MongoDB...")
        print(f"   URI: {mongo_uri[:50]}...")
        client = MongoClient(
            mongo_uri, 
            serverSelectionTimeoutMS=30000,  # 30 seconds
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            retryWrites=True,
            w='majority'
        )
        # Test connection
        client.admin.command('ping')
        db = client["market_analyzer"]
        collection = db["sales"]
        print("✅ Connected")
        
        print("\n🗑️  Clearing ALL existing data...")
        result = collection.delete_many({})
        print(f"✅ Deleted {result.deleted_count} old records")
        
        print("\n📊 Generating realistic data...")
        records = []
        current_date = datetime.now()
        
        for product, base_price in REALISTIC_PRICES.items():
            category = 'fruit' if product in ['Apple', 'Banana', 'Mango', 'Orange', 'Papaya', 
                                               'Pineapple', 'Guava', 'Watermelon', 'Muskmelon',
                                               'Pomegranate', 'Grapes', 'Sapota', 'Custard Apple',
                                               'Jackfruit', 'Lychee', 'Strawberry', 'Pear', 'Peach',
                                               'Kiwi', 'Dragon Fruit', 'Coconut', 'Sweet Lime',
                                               'Avocado'] else 'vegetable'
            
            # Generate 30 days of history
            for days_ago in range(30):
                date = current_date - timedelta(days=days_ago)
                
                # Add realistic daily variation (±10%)
                price = base_price * random.uniform(0.9, 1.1)
                
                # Calculate demand (inverse to price)
                base_demand = 150 - (price / 5)
                demand = max(50, base_demand + random.uniform(-20, 20))
                
                record = {
                    'date': date,
                    'product': product,
                    'category': category,
                    'price': round(price, 2),
                    'predicted_price': round(price, 2),
                    'quantity': round(demand, 1),
                    'predicted_demand': round(demand, 1),
                    'demand': round(demand, 1),
                    'stock': random.randint(80, 200),
                    'temperature': random.randint(20, 35),
                    'rainfall': random.randint(0, 50),
                    'unit': 'kg',
                    'source': 'emergency_fix',
                    'confidence': 'high'
                }
                records.append(record)
        
        print(f"✅ Created {len(records)} records for {len(REALISTIC_PRICES)} products")
        
        print("\n💾 Inserting into MongoDB...")
        result = collection.insert_many(records)
        print(f"✅ Inserted {len(result.inserted_ids)} records")
        
        # Verify
        print("\n📊 VERIFICATION:")
        print("-" * 70)
        
        pipeline = [
            {"$group": {
                "_id": None,
                "avg_price": {"$avg": "$price"},
                "min_price": {"$min": "$price"},
                "max_price": {"$max": "$price"},
                "count": {"$sum": 1}
            }}
        ]
        
        stats = list(collection.aggregate(pipeline))[0]
        
        print(f"   Total Records: {stats['count']}")
        print(f"   Products: {len(REALISTIC_PRICES)}")
        print(f"   Avg Price: ₹{stats['avg_price']:.2f}/kg")
        print(f"   Price Range: ₹{stats['min_price']:.2f} - ₹{stats['max_price']:.2f}/kg")
        
        print("\n💰 SAMPLE PRICES:")
        print("-" * 70)
        samples = ['Tomato', 'Potato', 'Onion', 'Red Onion', 'Apple', 'Banana', 'Strawberry']
        for product in samples:
            if product in REALISTIC_PRICES:
                print(f"   {product:15s}: ₹{REALISTIC_PRICES[product]:.2f}/kg")
        
        print("\n" + "=" * 70)
        print("✅ DATABASE FIXED SUCCESSFULLY!")
        print("=" * 70)
        print("\n📝 NEXT STEPS:")
        print("   1. Restart the ML API (if running)")
        print("   2. Restart the Backend Server (if running)")
        print("   3. Refresh your browser (Ctrl + F5)")
        print("   4. Check Dashboard - Avg Price should be ~₹100-120/kg")
        print("\n")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    success = fix_database()
    if success:
        print("✅ Fix completed successfully!")
        print("\nPlease restart your servers and refresh the browser.")
    else:
        print("❌ Fix failed. Please check the error messages above.")
    
    input("\nPress Enter to exit...")
