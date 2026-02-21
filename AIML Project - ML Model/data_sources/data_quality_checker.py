"""
Data quality checker for market data.
Validates freshness, completeness, and accuracy of data.
"""
from pymongo import MongoClient
import pandas as pd
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
load_dotenv()
class DataQualityChecker:
    """
    Checks quality and freshness of market data in MongoDB.
    """
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client["market_analyzer"]
        self.collection = self.db["sales"]
    def check_data_freshness(self):
        """
        Check how recent the data is.
        """
        try:
            latest = self.collection.find_one(sort=[("date", -1)])
            if not latest:
                return {
                    "status": "empty",
                    "message": "No data in database",
                    "last_update": None
                }
            latest_date = latest.get("date")
            if isinstance(latest_date, str):
                latest_date = pd.to_datetime(latest_date)
            age = datetime.now() - latest_date
            if age.days == 0:
                status = "fresh"
                message = "Data is up-to-date (today)"
            elif age.days <= 1:
                status = "recent"
                message = f"Data is {age.days} day old"
            elif age.days <= 7:
                status = "acceptable"
                message = f"Data is {age.days} days old"
            else:
                status = "stale"
                message = f"Data is {age.days} days old - update recommended"
            return {
                "status": status,
                "message": message,
                "last_update": latest_date.strftime("%Y-%m-%d %H:%M:%S"),
                "age_days": age.days
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "last_update": None
            }
    def check_data_completeness(self):
        """
        Check if all required products have data.
        """
        required_products = ["Tomato", "Potato", "Onion", "Apple", "Banana"]
        try:
            products = self.collection.distinct("product")
            missing = [p for p in required_products if p not in products]
            extra = [p for p in products if p not in required_products]
            coverage = (len(products) / len(required_products)) * 100
            return {
                "total_products": len(products),
                "required_products": len(required_products),
                "coverage_percent": round(coverage, 2),
                "missing_products": missing,
                "extra_products": extra,
                "status": "complete" if not missing else "incomplete"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    def check_data_sources(self):
        """
        Check which data sources are being used.
        """
        try:
            sources = self.collection.distinct("source")
            source_counts = {}
            for source in sources:
                count = self.collection.count_documents({"source": source})
                source_counts[source] = count
            return {
                "sources": sources,
                "source_distribution": source_counts,
                "total_sources": len(sources)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    def get_statistics(self):
        """
        Get overall data statistics.
        """
        try:
            total_records = self.collection.count_documents({})
            oldest = self.collection.find_one(sort=[("date", 1)])
            newest = self.collection.find_one(sort=[("date", -1)])
            oldest_date = oldest.get("date") if oldest else None
            newest_date = newest.get("date") if newest else None
            if isinstance(oldest_date, str):
                oldest_date = pd.to_datetime(oldest_date)
            if isinstance(newest_date, str):
                newest_date = pd.to_datetime(newest_date)
            return {
                "total_records": total_records,
                "oldest_record": oldest_date.strftime("%Y-%m-%d") if oldest_date else None,
                "newest_record": newest_date.strftime("%Y-%m-%d") if newest_date else None,
                "date_range_days": (newest_date - oldest_date).days if oldest_date and newest_date else 0
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    def generate_report(self):
        """
        Generate comprehensive data quality report.
        """
        print("\n" + "=" * 60)
        print("📊 DATA QUALITY REPORT")
        print("=" * 60)
        freshness = self.check_data_freshness()
        print(f"\n🕐 Data Freshness: {freshness['status'].upper()}")
        print(f"   {freshness['message']}")
        if freshness['last_update']:
            print(f"   Last update: {freshness['last_update']}")
        completeness = self.check_data_completeness()
        print(f"\n📦 Data Completeness: {completeness['status'].upper()}")
        print(f"   Coverage: {completeness['coverage_percent']}%")
        print(f"   Products: {completeness['total_products']}/{completeness['required_products']}")
        if completeness['missing_products']:
            print(f"   Missing: {', '.join(completeness['missing_products'])}")
        sources = self.check_data_sources()
        print(f"\n🌐 Data Sources: {sources['total_sources']} active")
        for source, count in sources['source_distribution'].items():
            print(f"   • {source}: {count} records")
        stats = self.get_statistics()
        print(f"\n📈 Statistics:")
        print(f"   Total records: {stats['total_records']}")
        print(f"   Date range: {stats['oldest_record']} to {stats['newest_record']}")
        print(f"   Coverage: {stats['date_range_days']} days")
        print("\n" + "=" * 60)
        print("\n💡 Recommendations:")
        if freshness['status'] == 'stale':
            print("   ⚠️  Run update_market_data.py to fetch fresh data")
        if completeness['status'] == 'incomplete':
            print("   ⚠️  Some products are missing - check API configuration")
        if stats['total_records'] < 100:
            print("   ⚠️  Low data volume - consider running scheduler for continuous updates")
        if freshness['status'] == 'fresh' and completeness['status'] == 'complete':
            print("   ✅ Data quality is excellent!")
        print("\n")
def main():
    checker = DataQualityChecker()
    checker.generate_report()
if __name__ == "__main__":
    main()