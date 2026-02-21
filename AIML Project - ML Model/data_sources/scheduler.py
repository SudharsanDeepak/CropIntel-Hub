"""
Automated scheduler for periodic market data updates.
Runs in background and updates MongoDB with fresh data.
"""
import schedule
import time
from datetime import datetime
import os
from dotenv import load_dotenv
from data_sources.api_fetcher import MarketDataFetcher
load_dotenv()
class DataUpdateScheduler:
    """
    Schedules automatic data updates at specified intervals.
    """
    def __init__(self):
        self.fetcher = MarketDataFetcher()
        self.update_interval = float(os.getenv("DATA_UPDATE_INTERVAL", 24))
    def update_job(self):
        """
        Job to run on schedule.
        """
        print(f"\n⏰ Scheduled update triggered at {datetime.now()}")
        self.fetcher.update_market_data()
    def start(self):
        """
        Start the scheduler.
        """
        print("=" * 60)
        print("🚀 MARKET DATA SCHEDULER STARTED")
        print("=" * 60)
        print(f"📅 Update interval: Every {self.update_interval} hours")
        print(f"⏰ Next update: {datetime.now()}")
        print("=" * 60)
        self.update_job()
        schedule.every(self.update_interval).hours.do(self.update_job)
        while True:
            schedule.run_pending()
            time.sleep(60)
def main():
    """
    Start the scheduler as a background service.
    """
    scheduler = DataUpdateScheduler()
    scheduler.start()
if __name__ == "__main__":
    main()