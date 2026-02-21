"""
Blinkit API Data Fetcher (Advanced)
Uses Blinkit's internal API endpoints for more reliable data fetching.
⚠️ IMPORTANT: Educational/Research purposes only.
"""
import requests
import json
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import time
load_dotenv()
class BlinkitAPIFetcher:
    """
    Fetches data using Blinkit's internal API endpoints.
    More reliable than HTML scraping.
    """
    def __init__(self):
        self.api_base = "https://blinkit.com/v2"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://blinkit.com',
            'Referer': 'https://blinkit.com/'
        }
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client["market_analyzer"]
        self.collection = self.db["sales"]
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    def get_location_token(self, lat=28.6139, lon=77.2090):
        """
        Get location token for Delhi (default).
        Blinkit requires location for showing products.
        Args:
            lat: Latitude
            lon: Longitude
        """
        try:
            url = f"{self.api_base}/locations"
            payload = {
                "lat": lat,
                "lon": lon
            }
            response = self.session.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get('token', None)
            return None
        except Exception as e:
            print(f"❌ Location token error: {str(e)}")
            return None
    def fetch_category_products(self, category_id, page=1, limit=50):
        """
        Fetch products from a specific category using API.
        Args:
            category_id: Category ID (e.g., 1487 for fruits-vegetables)
            page: Page number
            limit: Products per page
        Returns:
            List of products
        """
        try:
            url = f"{self.api_base}/products"
            params = {
                'category_id': category_id,
                'page': page,
                'limit': limit
            }
            response = self.session.get(url, params=params, timeout=15)
            if response.status_code == 200:
                data = response.json()
                return self._parse_api_response(data)
            else:
                print(f"⚠️  API returned status {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ API fetch error: {str(e)}")
            return []
    def _parse_api_response(self, data):
        """Parse API response and extract product information"""
        products = []
        try:
            items = data.get('products', []) or data.get('data', [])
            for item in items:
                product = {
                    'date': datetime.now(),
                    'product': item.get('name', 'Unknown'),
                    'price': float(item.get('price', 0) or item.get('offer_price', 0)),
                    'original_price': float(item.get('mrp', 0)),
                    'discount': item.get('discount_percentage', 0),
                    'quantity': self._parse_quantity(item.get('unit', '1 kg')),
                    'stock': 100 if item.get('in_stock', True) else 0,
                    'temperature': 0,
                    'rainfall': 0,
                    'source': 'blinkit_api',
                    'product_id': item.get('id', ''),
                    'category': item.get('category', ''),
                    'brand': item.get('brand', 'Blinkit'),
                    'image_url': item.get('image_url', ''),
                    'rating': item.get('rating', 0),
                    'reviews_count': item.get('reviews_count', 0)
                }
                products.append(product)
        except Exception as e:
            print(f"❌ Parse error: {str(e)}")
        return products
    def _parse_quantity(self, unit_str):
        """Parse quantity from unit string (e.g., '1 kg' -> 1000g)"""
        import re
        try:
            numbers = re.findall(r'\d+\.?\d*', unit_str)
            if not numbers:
                return 100
            value = float(numbers[0])
            if 'kg' in unit_str.lower():
                return value * 1000
            elif 'g' in unit_str.lower():
                return value
            elif 'l' in unit_str.lower():
                return value * 1000
            else:
                return value
        except:
            return 100
    def fetch_all_fruits_vegetables(self):
        """
        Fetch all fruits and vegetables using API.
        """
        all_products = []
        categories = {
            'Fruits & Vegetables': 1487,
            'Fresh Vegetables': 1488,
            'Fresh Fruits': 1489,
            'Exotic Fruits & Vegetables': 1490,
            'Organic Fruits & Vegetables': 1491
        }
        print("\n" + "=" * 60)
        print("🛒 BLINKIT API DATA FETCHER")
        print("=" * 60)
        print("📍 Setting location...")
        token = self.get_location_token()
        if token:
            print("   ✅ Location set")
        for category_name, category_id in categories.items():
            print(f"\n📦 Fetching: {category_name}")
            page = 1
            while True:
                products = self.fetch_category_products(category_id, page=page)
                if not products:
                    break
                all_products.extend(products)
                print(f"   ✅ Page {page}: {len(products)} products")
                if len(products) < 50:
                    break
                page += 1
                time.sleep(2)
        return all_products
    def save_to_mongodb(self, products):
        """Save products to MongoDB"""
        if not products:
            print("⚠️  No products to save")
            return 0
        try:
            result = self.collection.insert_many(products)
            print(f"\n✅ Saved {len(result.inserted_ids)} products to MongoDB")
            return len(result.inserted_ids)
        except Exception as e:
            print(f"❌ MongoDB save error: {str(e)}")
            return 0
    def run(self):
        """Main execution method"""
        products = self.fetch_all_fruits_vegetables()
        if products:
            print(f"\n📊 Total products: {len(products)}")
            print("\n📋 Sample products:")
            for i, p in enumerate(products[:5], 1):
                print(f"   {i}. {p['product']} - ₹{p['price']}")
            self.save_to_mongodb(products)
            print("\n" + "=" * 60)
            print("✅ FETCH COMPLETE")
            print("=" * 60)
        else:
            print("\n⚠️  No products fetched")
            print("💡 Tips:")
            print("   1. Inspect Blinkit's network requests in browser DevTools")
            print("   2. Update API endpoints in the code")
            print("   3. Check if authentication is required")
            print("   4. Verify category IDs are correct")
def main():
    """
    Run the Blinkit API fetcher.
    SETUP INSTRUCTIONS:
    1. Open Blinkit website in browser
    2. Open DevTools (F12) -> Network tab
    3. Browse to Fruits & Vegetables section
    4. Look for API calls (usually JSON responses)
    5. Copy the API endpoint URLs
    6. Update the endpoints in this code
    7. Check if any authentication headers are needed
    """
    print("\n📝 SETUP REQUIRED:")
    print("Before running, you need to:")
    print("1. Inspect Blinkit's API endpoints using browser DevTools")
    print("2. Update API URLs in the code")
    print("3. Add any required authentication headers")
    print("\nContinue anyway? (yes/no): ", end='')
    fetcher = BlinkitAPIFetcher()
    fetcher.run()
if __name__ == "__main__":
    main()