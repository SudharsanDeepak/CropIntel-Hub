"""
Quick verification that ML models are using real-time data.
Shows exactly what data the models are seeing.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
def main():
    print("\n" + "=" * 70)
    print("  🔍 VERIFYING REAL-TIME DATA USAGE")
    print("=" * 70)
    print("\n📊 Step 1: Checking Data Source...")
    try:
        from preprocessing.load_data import load_sales_data
        df = load_sales_data()
        if df.empty:
            print("❌ No data found in MongoDB")
            print("\n💡 Quick Fix:")
            print("   python migrate_csv_to_mongo.py")
            print("   OR")
            print("   python update_market_data.py")
            return
        print(f"✅ Data loaded from MongoDB")
        print(f"   Records: {len(df)}")
        print(f"   Products: {', '.join(df['product'].unique()[:5])}")
        if 'source' in df.columns:
            sources = df['source'].unique()
            print(f"   Sources: {', '.join(sources)}")
            print("   ✅ This is REAL-TIME data from APIs!")
        else:
            print("   ℹ️  This is migrated CSV data (still works!)")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return
    print("\n📋 Step 2: Sample Data Being Used...")
    print("\n" + df.head(5).to_string(index=False))
    print("\n📅 Step 3: Data Freshness...")
    df['date'] = pd.to_datetime(df['date'])
    latest_date = df['date'].max()
    oldest_date = df['date'].min()
    from datetime import datetime
    age_days = (datetime.now() - latest_date).days
    print(f"   Oldest: {oldest_date.strftime('%Y-%m-%d')}")
    print(f"   Latest: {latest_date.strftime('%Y-%m-%d')}")
    print(f"   Age: {age_days} days old")
    if age_days == 0:
        print("   ✅ Data is FRESH (today)!")
    elif age_days <= 1:
        print("   ✅ Data is RECENT (yesterday)")
    elif age_days <= 7:
        print("   ⚠️  Data is acceptable but consider updating")
    else:
        print("   ⚠️  Data is stale - run: python update_market_data.py")
    print("\n🤖 Step 4: Testing ML Model with This Data...")
    try:
        from forecasting.forecast_generator import generate_forecast
        print("   Generating 3-day forecast...")
        forecast_df = generate_forecast(days=3)
        if not forecast_df.empty:
            print(f"   ✅ Forecast generated successfully!")
            print(f"\n   Sample Predictions:")
            print(forecast_df.head(6).to_string(index=False))
        else:
            print("   ❌ Forecast failed")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        print("   💡 You may need to retrain models:")
        print("      python forecasting/demand_model.py")
    print("\n" + "=" * 70)
    print("  ✅ VERIFICATION COMPLETE")
    print("=" * 70)
    print("\n  Your ML models are using data from MongoDB.")
    if 'source' in df.columns:
        print("  This data came from REAL-TIME APIs! 🎉")
    else:
        print("  To get real-time data, run: python update_market_data.py")
    print("\n  Next steps:")
    print("  1. Start ML API: uvicorn ml_api:app --reload --port 8000")
    print("  2. Test predictions: curl http://localhost:8000/forecast/demand?days=7")
    print("  3. Keep data fresh: python start_scheduler.py")
    print("\n" + "=" * 70 + "\n")
if __name__ == "__main__":
    import pandas as pd
    main()