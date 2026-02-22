"""
Real-time market data fetcher for vegetables and fruits.
Integrates with multiple data sources and stores in MongoDB.
"""
import requests
import pandas as pd
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
class MarketDataFetcher:
    """
    Fetches real-time market data from various sources.
    Priority: Government APIs > Agricultural APIs > Fallback to manual data
    """
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client["market_analyzer"]
        self.collection = self.db["sales"]
    def fetch_agmarknet_data(self, commodity, state="All", district="All"):
        """
        Fetch data from India's Agmarknet API (Government source).
        Note: Requires API key registration at https://agmarknet.gov.in/
        """
        try:
            api_key = os.getenv("AGMARKNET_API_KEY", "")
            if not api_key or api_key == "not_required":
                print(f"⚠️  Agmarknet API key not configured")
                return None
            
            base_url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
            params = {
                "api-key": api_key,
                "format": "json",
                "filters[commodity]": commodity,
                "limit": 100
            }
            
            headers = {
                "User-Agent": "CropIntelHub/1.0",
                "Accept": "application/json"
            }
            
            response = requests.get(base_url, params=params, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "records" in data and len(data["records"]) > 0:
                    print(f"✅ Agmarknet: Fetched {len(data['records'])} records for {commodity}")
                    return self._parse_agmarknet_response(data)
                else:
                    print(f"⚠️  Agmarknet: No records found for {commodity}")
                    return None
            elif response.status_code == 403:
                print(f"⚠️  Agmarknet API: Access forbidden (403) - Check API key validity")
                print(f"   API Key used: {api_key[:10]}...")
                return None
            else:
                print(f"⚠️  Agmarknet API returned status {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return None
        except Exception as e:
            print(f"❌ Agmarknet fetch failed: {str(e)}")
            return None
    def fetch_usda_data(self, commodity):
        """
        Fetch data from USDA Market News API (for international prices).
        Free API, no key required for basic access.
        """
        try:
            base_url = "https://marsapi.ams.usda.gov/services/v1.2/reports"
            params = {
                "q": commodity,
                "limit": 50
            }
            
            headers = {
                "User-Agent": "CropIntelHub/1.0",
                "Accept": "application/json"
            }
            
            response = requests.get(base_url, params=params, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data and len(data["results"]) > 0:
                    print(f"✅ USDA: Fetched {len(data['results'])} reports for {commodity}")
                    return self._parse_usda_response(data, commodity)
                else:
                    print(f"⚠️  USDA: No reports found for {commodity}")
                    return None
            elif response.status_code == 403:
                print(f"⚠️  USDA API: Access forbidden (403) - May need API key")
                return None
            else:
                print(f"⚠️  USDA API returned status {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return None
        except Exception as e:
            print(f"❌ USDA fetch failed: {str(e)}")
            return None
    def fetch_open_food_facts(self, product):
        """
        Fetch product data from Open Food Facts API.
        Provides nutritional and pricing information.
        """
        try:
            base_url = f"https://world.openfoodfacts.org/cgi/search.pl"
            params = {
                "search_terms": product,
                "search_simple": 1,
                "action": "process",
                "json": 1,
                "page_size": 20
            }
            response = requests.get(base_url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return self._parse_openfoodfacts_response(data, product)
            else:
                return None
        except Exception as e:
            print(f"❌ Open Food Facts fetch failed: {str(e)}")
            return None
    def _parse_agmarknet_response(self, data):
        """Parse Agmarknet API response"""
        records = []
        if "records" in data:
            for record in data["records"]:
                records.append({
                    "date": datetime.strptime(record.get("arrival_date", ""), "%Y-%m-%d"),
                    "product": record.get("commodity", "Unknown"),
                    "quantity": float(record.get("arrivals", 0)),
                    "price": float(record.get("modal_price", 0)),
                    "stock": float(record.get("arrivals", 0)),
                    "temperature": 0,  # Not available in API
                    "rainfall": 0,  # Not available in API
                    "source": "agmarknet"
                })
        return records
    def _parse_usda_response(self, data, commodity):
        """Parse USDA API response"""
        records = []
        if "results" in data:
            for item in data["results"]:
                try:
                    records.append({
                        "date": datetime.now(),
                        "product": commodity,
                        "quantity": 100,
                        "price": self._extract_price_from_text(item.get("report_text", "")),
                        "stock": 100,
                        "temperature": 0,
                        "rainfall": 0,
                        "source": "usda"
                    })
                except:
                    continue
        return records
    def _parse_openfoodfacts_response(self, data, product):
        """Parse Open Food Facts API response"""
        records = []
        if "products" in data and len(data["products"]) > 0:
            avg_price = 0
            count = 0
            for item in data["products"]:
                if "price" in item:
                    avg_price += float(item["price"])
                    count += 1
            if count > 0:
                records.append({
                    "date": datetime.now(),
                    "product": product,
                    "quantity": 100,
                    "price": avg_price / count,
                    "stock": 100,
                    "temperature": 0,
                    "rainfall": 0,
                    "source": "openfoodfacts"
                })
        return records
    def _extract_price_from_text(self, text):
        """Extract price from report text using regex"""
        import re
        pattern = r'\$?(\d+\.?\d*)'
        matches = re.findall(pattern, text)
        if matches:
            return float(matches[0])
        return 0.0
    def fetch_all_products(self, products=None):
        """
        Fetch data for all configured products from multiple sources.
        """
        if products is None:
            products = ["Tomato", "Potato", "Onion", "Apple", "Banana", 
                       "Carrot", "Cabbage", "Cauliflower", "Orange", "Mango"]
        all_records = []
        print("🔄 Fetching real-time market data...")
        print("=" * 50)
        for product in products:
            print(f"\n📦 Fetching data for: {product}")
            records = self.fetch_agmarknet_data(product)
            if records:
                all_records.extend(records)
                print(f"   ✅ Agmarknet: {len(records)} records")
            records = self.fetch_usda_data(product)
            if records:
                all_records.extend(records)
                print(f"   ✅ USDA: {len(records)} records")
            records = self.fetch_open_food_facts(product)
            if records:
                all_records.extend(records)
                print(f"   ✅ Open Food Facts: {len(records)} records")
        return all_records
    def save_to_mongodb(self, records):
        """
        Save fetched records to MongoDB.
        """
        if not records:
            print("⚠️  No records to save")
            return 0
        try:
            result = self.collection.insert_many(records)
            print(f"\n✅ Saved {len(result.inserted_ids)} records to MongoDB")
            return len(result.inserted_ids)
        except Exception as e:
            print(f"❌ Failed to save to MongoDB: {str(e)}")
            return 0
    def update_market_data(self):
        """
        Main method to fetch and update market data.
        """
        print("\n" + "=" * 50)
        print("🌐 REAL-TIME MARKET DATA UPDATE")
        print("=" * 50)
        records = self.fetch_all_products()
        if records:
            saved_count = self.save_to_mongodb(records)
            print("\n" + "=" * 50)
            print(f"📊 Summary: {saved_count} records updated")
            print("=" * 50)
        else:
            print("\n⚠️  No data fetched from any source")
            print("💡 Check API keys and network connectivity")
def main():
    """
    Run the market data fetcher.
    """
    fetcher = MarketDataFetcher()
    fetcher.update_market_data()
if __name__ == "__main__":
    main()