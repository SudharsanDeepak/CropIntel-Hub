"""
Quick start script to test and populate the database.
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def main():
    print("\n" + "=" * 70)
    print("🚀 CROPINTELHUB - QUICK START")
    print("=" * 70)
    
    print("\n1️⃣  Testing Agmarknet API Key...")
    print("-" * 70)
    
    try:
        from test_agmarknet_api import test_agmarknet_api
        test_agmarknet_api()
    except Exception as e:
        print(f"⚠️  API test failed: {str(e)}")
        print("   Don't worry! The system will use fallback data sources.")
    
    print("\n\n2️⃣  Populating Database with 180 Products...")
    print("-" * 70)
    
    try:
        from data_sources.comprehensive_market_fetcher import ComprehensiveMarketFetcher
        
        fetcher = ComprehensiveMarketFetcher()
        saved_count = fetcher.update_all_products(days=30)
        
        if saved_count > 0:
            print(f"\n✅ SUCCESS! Database populated with {saved_count} records")
        else:
            print("\n⚠️  No records saved. Check MongoDB connection.")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check if MongoDB URI is correct in .env file")
        print("2. Verify MongoDB connection: python test_mongo_connection.py")
        print("3. Check if all dependencies are installed: pip install -r requirements.txt")
    
    print("\n\n3️⃣  Next Steps")
    print("-" * 70)
    print("✅ ML API is running on: http://127.0.0.1:8000")
    print("\n📋 To start the complete system:")
    print("   1. Keep ML API running (current terminal)")
    print("   2. Open new terminal: cd 'AIML Project - Server' && npm start")
    print("   3. Open new terminal: cd 'AIML Project - Website' && npm run dev")
    print("\n🌐 Then open: http://localhost:5173")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
