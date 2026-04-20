"""
Daily Market Data Update Script
Fetches real-time market prices from multiple sources and updates MongoDB.
Run this script daily (manually or via cron/task scheduler) to keep prices current.
"""
import sys
import os
from datetime import datetime
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

def main():
    print("\n" + "=" * 80)
    print("📅 DAILY MARKET DATA UPDATE")
    print("=" * 80)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")
    
    # Step 1: Fetch from Comprehensive Market Fetcher (Agmarknet + USDA + Simulation)
    print("🌐 Step 1: Fetching from Government APIs and Market Sources...")
    print("-" * 80)
    try:
        from data_sources.comprehensive_market_fetcher import ComprehensiveMarketFetcher
        fetcher = ComprehensiveMarketFetcher()
        records_saved = fetcher.update_all_products(days=7)
        print(f"✅ Comprehensive fetch complete: {records_saved} records saved\n")
    except Exception as e:
        print(f"❌ Comprehensive fetch failed: {str(e)}\n")
    
    # Step 2: Optional Blinkit import (disabled by default for safety)
    blinkit_enabled = os.getenv("BLINKIT_IMPORT_ENABLED", "false").lower() == "true"
    if blinkit_enabled:
        print("🛒 Step 2: Attempting Blinkit API for real Indian market prices...")
        print("-" * 80)
        try:
            from data_sources.blinkit_api_fetcher import BlinkitAPIFetcher
            blinkit = BlinkitAPIFetcher()
            products = blinkit.fetch_all_fruits_vegetables()
            if products:
                saved = blinkit.save_to_mongodb(products)
                print(f"✅ Blinkit fetch complete: {saved} products saved\n")
            else:
                print("⚠️  Blinkit API returned no data (may require setup)\n")
        except Exception as e:
            print(f"⚠️  Blinkit fetch skipped: {str(e)}\n")
    else:
        print("🛒 Step 2: Blinkit import disabled (BLINKIT_IMPORT_ENABLED=false)\n")
    
    # Step 3: Update weather data
    print("🌤️  Step 3: Updating weather data...")
    print("-" * 80)
    try:
        from data_sources.weather_fetcher import WeatherFetcher
        weather = WeatherFetcher()
        weather_data = weather.fetch_average_weather()
        print(f"✅ Weather updated:")
        print(f"   Temperature: {weather_data['temperature']}°C")
        print(f"   Rainfall: {weather_data['rainfall']} mm")
        print(f"   Humidity: {weather_data.get('humidity', 'N/A')}%\n")
    except Exception as e:
        print(f"⚠️  Weather update failed: {str(e)}\n")
    
    # Step 4: Verify data quality
    print("🔍 Step 4: Verifying data quality...")
    print("-" * 80)
    try:
        from pymongo import MongoClient
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        client = MongoClient(mongo_uri)
        db = client["market_analyzer"]
        collection = db["sales"]
        
        # Count total records
        total_records = collection.count_documents({})
        
        # Count records from today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_records = collection.count_documents({"date": {"$gte": today_start}})
        
        # Count unique products
        unique_products = len(collection.distinct("product"))
        
        # Get data sources breakdown
        sources = collection.aggregate([
            {"$group": {"_id": "$source", "count": {"$sum": 1}}}
        ])
        
        print(f"✅ Data Quality Report:")
        print(f"   Total records in database: {total_records}")
        print(f"   Records added today: {today_records}")
        print(f"   Unique products tracked: {unique_products}")
        print(f"\n   Data sources breakdown:")
        for source in sources:
            print(f"      - {source['_id']}: {source['count']} records")
        print()
        
    except Exception as e:
        print(f"⚠️  Data verification failed: {str(e)}\n")
    
    # Summary
    print("=" * 80)
    print("✅ DAILY UPDATE COMPLETE")
    print("=" * 80)
    print(f"🕐 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80 + "\n")
    
    print("💡 Next steps:")
    print("   1. Set up Windows Task Scheduler to run this script daily")
    print("   2. Or use the scheduler: python start_scheduler.py")
    print("   3. Monitor logs to ensure data is updating correctly")
    print()

if __name__ == "__main__":
    main()
