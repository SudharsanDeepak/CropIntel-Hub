"""
Test script to verify MongoDB connection from ML service.
Run this to ensure the ML model can connect to MongoDB Atlas.
"""
from preprocessing.load_data import load_sales_data
import os
from dotenv import load_dotenv
load_dotenv()
def test_connection():
    print("=" * 50)
    print("Testing MongoDB Connection from ML Service")
    print("=" * 50)
    mongo_uri = os.getenv("MONGO_URI", "Not found")
    print(f"\n📍 MongoDB URI: {mongo_uri[:30]}...")
    try:
        print("\n🔄 Attempting to load sales data...")
        df = load_sales_data()
        if df.empty:
            print("⚠️  Connection successful but no data found in 'sales' collection")
            print("💡 Run migrate_csv_to_mongo.py to populate the database")
        else:
            print(f"✅ Connection successful!")
            print(f"📊 Loaded {len(df)} records from MongoDB")
            print(f"\n📋 Columns: {list(df.columns)}")
            print(f"\n🔍 Sample data:")
            print(df.head(3))
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("\n💡 Troubleshooting:")
        print("   1. Check if MONGO_URI is set in .env file")
        print("   2. Verify MongoDB Atlas credentials")
        print("   3. Check network connectivity")
        print("   4. Ensure IP address is whitelisted in MongoDB Atlas")
if __name__ == "__main__":
    test_connection()