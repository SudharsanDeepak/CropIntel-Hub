"""
Quick script to update market data.
Run this anytime to fetch latest prices and demand data.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data_sources.comprehensive_market_fetcher import ComprehensiveMarketFetcher
def main():
    print("\n" + "=" * 60)
    print("🚀 MARKET DATA UPDATE UTILITY")
    print("=" * 60)
    print("\nThis will fetch real-time data for vegetables and fruits")
    print("from multiple sources and update MongoDB.\n")
    response = input("Continue? (y/n): ").strip().lower()
    if response != 'y':
        print("❌ Update cancelled")
        return
    fetcher = ComprehensiveMarketFetcher()
    fetcher.update_all_products(days=7)
    print("\n✅ Update complete!")
    print("💡 Your ML models will now use this fresh data for predictions.\n")
if __name__ == "__main__":
    main()