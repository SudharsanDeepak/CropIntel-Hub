"""
Quick status check for market data system.
Shows current state of data and system health.
"""
import sys
import os
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data_sources.data_quality_checker import DataQualityChecker
from preprocessing.load_data import load_sales_data
def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)
def main():
    print_header("🔍 MARKET DATA SYSTEM STATUS")
    print("\n📡 MongoDB Connection...")
    try:
        df = load_sales_data()
        if df.empty:
            print("   ⚠️  Connected but no data found")
            print("   💡 Run: python update_market_data.py")
        else:
            print(f"   ✅ Connected - {len(df)} records available")
    except Exception as e:
        print(f"   ❌ Connection failed: {str(e)}")
        return
    print("\n📊 Data Quality Check...")
    try:
        checker = DataQualityChecker()
        freshness = checker.check_data_freshness()
        status_icon = {
            'fresh': '✅',
            'recent': '✅',
            'acceptable': '⚠️',
            'stale': '❌',
            'empty': '❌'
        }.get(freshness['status'], '❓')
        print(f"   {status_icon} Freshness: {freshness['message']}")
        completeness = checker.check_data_completeness()
        comp_icon = '✅' if completeness['status'] == 'complete' else '⚠️'
        print(f"   {comp_icon} Completeness: {completeness['coverage_percent']}% coverage")
        sources = checker.check_data_sources()
        print(f"   📡 Data Sources: {sources['total_sources']} active")
    except Exception as e:
        print(f"   ❌ Quality check failed: {str(e)}")
    print("\n🥬 Available Products...")
    try:
        products = df['product'].unique()
        print(f"   Total: {len(products)} products")
        for i, product in enumerate(sorted(products)[:10], 1):
            count = len(df[df['product'] == product])
            print(f"   {i}. {product}: {count} records")
        if len(products) > 10:
            print(f"   ... and {len(products) - 10} more")
    except Exception as e:
        print(f"   ❌ Could not list products: {str(e)}")
    print_header("💡 RECOMMENDATIONS")
    if df.empty:
        print("\n   🔴 CRITICAL: No data available")
        print("   → Run: python update_market_data.py")
    elif freshness['status'] in ['stale', 'acceptable']:
        print("\n   ⚠️  Data needs updating")
        print("   → Run: python update_market_data.py")
        print("   → Or start scheduler: python start_scheduler.py")
    elif completeness['coverage_percent'] < 100:
        print("\n   ⚠️  Some products missing")
        print("   → Check API configuration in .env")
    else:
        print("\n   ✅ System is healthy!")
        print("   → Data is fresh and complete")
        print("   → ML models ready for predictions")
    print("\n" + "=" * 60)
    print(f"  Status checked at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60 + "\n")
if __name__ == "__main__":
    main()