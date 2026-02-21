"""
Start the automated market data scheduler.
This runs continuously and updates data every 24 hours.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data_sources.scheduler import DataUpdateScheduler
def main():
    print("\n" + "=" * 60)
    print("🤖 AUTOMATED MARKET DATA SCHEDULER")
    print("=" * 60)
    print("\nThis will run continuously and update market data")
    print("automatically every 24 hours (configurable in .env).\n")
    print("Press Ctrl+C to stop the scheduler.\n")
    try:
        scheduler = DataUpdateScheduler()
        scheduler.start()
    except KeyboardInterrupt:
        print("\n\n⏹️  Scheduler stopped by user")
        print("✅ Goodbye!\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("💡 Check your .env configuration and MongoDB connection\n")
if __name__ == "__main__":
    main()