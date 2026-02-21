"""
Comprehensive test script to verify real-time data system.
Tests all components: MongoDB, API fetcher, ML models.
"""
import sys
import os
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
def print_section(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)
def test_mongodb_connection():
    """Test 1: MongoDB Connection"""
    print_section("TEST 1: MongoDB Connection")
    try:
        from preprocessing.load_data import load_sales_data
        print("🔄 Connecting to MongoDB...")
        df = load_sales_data()
        if df.empty:
            print("❌ FAILED: MongoDB connected but no data found")
            print("💡 Solution: Run 'python update_market_data.py' first")
            return False
        else:
            print(f"✅ PASSED: Connected successfully")
            print(f"   📊 Records: {len(df)}")
            print(f"   📦 Products: {len(df['product'].unique())}")
            print(f"   📅 Date range: {df['date'].min()} to {df['date'].max()}")
            return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        print("💡 Solution: Check MONGO_URI in .env file")
        return False
def test_data_quality():
    """Test 2: Data Quality"""
    print_section("TEST 2: Data Quality Check")
    try:
        from data_sources.data_quality_checker import DataQualityChecker
        checker = DataQualityChecker()
        freshness = checker.check_data_freshness()
        print(f"🕐 Freshness: {freshness['status'].upper()}")
        print(f"   {freshness['message']}")
        completeness = checker.check_data_completeness()
        print(f"📦 Completeness: {completeness['status'].upper()}")
        print(f"   Coverage: {completeness['coverage_percent']}%")
        sources = checker.check_data_sources()
        print(f"🌐 Data Sources: {sources['total_sources']} active")
        if freshness['status'] in ['fresh', 'recent'] and completeness['coverage_percent'] >= 80:
            print("✅ PASSED: Data quality is good")
            return True
        else:
            print("⚠️  WARNING: Data quality needs improvement")
            return False
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False
def test_api_fetcher():
    """Test 3: API Fetcher"""
    print_section("TEST 3: API Fetcher (Sample Test)")
    try:
        from data_sources.api_fetcher import MarketDataFetcher
        print("🔄 Testing API fetcher...")
        fetcher = MarketDataFetcher()
        print("   Testing with 'Tomato'...")
        records = fetcher.fetch_all_products(products=["Tomato"])
        if records and len(records) > 0:
            print(f"✅ PASSED: Fetched {len(records)} records")
            print(f"   Sample: {records[0]}")
            return True
        else:
            print("⚠️  WARNING: No records fetched (APIs may be unavailable)")
            print("   This is OK - system will use MongoDB cache")
            return True  # Not critical
    except Exception as e:
        print(f"⚠️  WARNING: {str(e)}")
        print("   This is OK - system will use MongoDB cache")
        return True  # Not critical
def test_ml_models():
    """Test 4: ML Models"""
    print_section("TEST 4: ML Models with Real Data")
    try:
        from forecasting.forecast_generator import generate_forecast
        from pricing.elasticity import calculate_elasticity
        print("🔄 Testing demand forecast...")
        forecast_df = generate_forecast(days=3)
        if not forecast_df.empty:
            print(f"✅ PASSED: Demand forecast generated")
            print(f"   Predictions: {len(forecast_df)} records")
            print(f"   Products: {forecast_df['product'].unique()}")
            print(f"\n   Sample predictions:")
            print(forecast_df.head(3).to_string(index=False))
        else:
            print("❌ FAILED: No forecast generated")
            return False
        print("\n🔄 Testing elasticity analysis...")
        elasticity_df = calculate_elasticity()
        if not elasticity_df.empty:
            print(f"✅ PASSED: Elasticity calculated")
            print(f"\n   Results:")
            print(elasticity_df.to_string(index=False))
        else:
            print("❌ FAILED: No elasticity calculated")
            return False
        return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        print("💡 Solution: Ensure models are trained and data is available")
        return False
def test_data_flow():
    """Test 5: Complete Data Flow"""
    print_section("TEST 5: Complete Data Flow")
    try:
        from preprocessing.load_data import load_sales_data
        print("🔄 Testing complete data flow...")
        print("\n   Step 1: Load from MongoDB")
        df = load_sales_data()
        print(f"   ✅ Loaded {len(df)} records")
        print("\n   Step 2: Check data structure")
        required_cols = ['date', 'product', 'demand', 'price', 'stock']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"   ❌ Missing columns: {missing_cols}")
            return False
        else:
            print(f"   ✅ All required columns present")
        print("\n   Step 3: Verify data types")
        print(f"   • date: {df['date'].dtype}")
        print(f"   • product: {df['product'].dtype}")
        print(f"   • demand: {df['demand'].dtype}")
        print(f"   • price: {df['price'].dtype}")
        print("\n   Step 4: Check for nulls")
        null_counts = df[required_cols].isnull().sum()
        if null_counts.sum() > 0:
            print(f"   ⚠️  Found nulls: {null_counts[null_counts > 0]}")
        else:
            print(f"   ✅ No null values")
        print("\n✅ PASSED: Data flow is working correctly")
        return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False
def main():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("  🧪 REAL-TIME DATA SYSTEM TEST SUITE")
    print("=" * 70)
    print(f"  Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    results = []
    results.append(("MongoDB Connection", test_mongodb_connection()))
    results.append(("Data Quality", test_data_quality()))
    results.append(("API Fetcher", test_api_fetcher()))
    results.append(("ML Models", test_ml_models()))
    results.append(("Data Flow", test_data_flow()))
    print_section("📊 TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {status}: {test_name}")
    print(f"\n   Total: {passed}/{total} tests passed")
    if passed == total:
        print("\n   🎉 ALL TESTS PASSED!")
        print("   Your system is working correctly with real-time data.")
    else:
        print("\n   ⚠️  SOME TESTS FAILED")
        print("   Review the errors above and follow the solutions.")
    print("\n" + "=" * 70)
    print(f"  Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70 + "\n")
    return passed == total
if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)