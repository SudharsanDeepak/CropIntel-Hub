"""
Quick script to populate MongoDB with sample data for testing.
"""
import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random
load_dotenv()
def create_sample_data():
    """Create sample market data"""
    products = ["Tomato", "Potato", "Onion", "Apple", "Banana"]
    records = []
    start_date = datetime.now() - timedelta(days=30)
    for day in range(30):
        current_date = start_date + timedelta(days=day)
        for product in products:
            records.append({
                "date": current_date,
                "product": product,
                "quantity": random.uniform(80, 200),
                "price": random.uniform(15, 50),
                "stock": random.uniform(100, 300),
                "temperature": random.uniform(20, 35),
                "rainfall": random.uniform(0, 15),
                "source": "sample_data"
            })
    return records
def main():
    print("\n" + "=" * 60)
    print("🚀 QUICK DATABASE POPULATION")
    print("=" * 60)
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
        print("\n📊 Creating sample data...")
        records = create_sample_data()
        print(f"✅ Created {len(records)} records")
        print("\n💾 Inserting into MongoDB...")
        result = collection.insert_many(records)
        print(f"✅ Inserted {len(result.inserted_ids)} records")
        print("\n📈 Verification:")
        count = collection.count_documents({})
        products = collection.distinct("product")
        print(f"   Total records: {count}")
        print(f"   Products: {', '.join(products)}")
        print("\n" + "=" * 60)
        print("✅ DATABASE POPULATED SUCCESSFULLY!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Test: python verify_real_time_data.py")
        print("2. Start ML API: uvicorn ml_api:app --reload --port 8000")
        print("\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n💡 Troubleshooting:")
        print("   - Check MONGO_URI in .env")
        print("   - Verify internet connection")
        print("   - Check MongoDB Atlas IP whitelist")
if __name__ == "__main__":
    main()