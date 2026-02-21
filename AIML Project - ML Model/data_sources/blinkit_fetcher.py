"""
Blinkit Data Fetcher for Fruits and Vegetables
⚠️ IMPORTANT: This is for educational/research purposes only.
Please review Blinkit's Terms of Service before using.
"""
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import time
import re
load_dotenv()
class BlinkitDataFetcher:
    """
    Fetches fruits and vegetables data from Blinkit.
    ⚠️ DISCLAIMER:
    - This scraper is for educational/research purposes only
    - Web scraping may violate Blinkit's Terms of Service
    - Use responsibly with proper rate limiting
    - Consider using official APIs when available
    """
    def __init__(self):
        self.base_url = "https://blinkit.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client["market_analyzer"]
        self.collection = self.db["sales"]
        self.request_delay = 3
    def fetch_category_page(self, category_url):
        """
        Fetch products from a specific category page.
        Args:
            category_url: URL of the category (e.g., /cn/fruits-vegetables/cid/1487)
        Returns:
            List of product dictionaries
        """
        try:
            url = f"{self.base_url}{category_url}"
            print(f"🔍 Fetching: {url}")
            response = requests.get(url, headers=self.headers, timeout=15)
            if response.status_code == 200:
                return self._parse_product_page(response.text)
            else:
                print(f"⚠️  Status code: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error fetching category: {str(e)}")
            return []
    def _parse_product_page(self, html_content):
        """
        Parse HTML content to extract product information.
        Note: Blinkit's structure may change. This is a template.
        You'll need to inspect the actual HTML structure.
        """
        products = []
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            scripts = soup.find_all('script', type='application/ld+json')
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and 'offers' in data:
                        products.append(self._extract_from_json(data))
                except:
                    continue
            product_cards = soup.find_all('div', class_=re.compile(r'Product__'))
            for card in product_cards:
                try:
                    product = self._extract_from_html(card)
                    if product:
                        products.append(product)
                except Exception as e:
                    continue
            print(f"   ✅ Found {len(products)} products")
        except Exception as e:
            print(f"❌ Parsing error: {str(e)}")
        return products
    def _extract_from_json(self, json_data):
        """Extract product data from JSON-LD format"""
        try:
            return {
                'date': datetime.now(),
                'product': json_data.get('name', 'Unknown'),
                'price': float(json_data.get('offers', {}).get('price', 0)),
                'quantity': 100,  # Default
                'stock': 100 if json_data.get('offers', {}).get('availability') == 'InStock' else 0,
                'temperature': 0,
                'rainfall': 0,
                'source': 'blinkit',
                'url': json_data.get('url', ''),
                'image': json_data.get('image', ''),
                'brand': json_data.get('brand', {}).get('name', 'Blinkit')
            }
        except:
            return None
    def _extract_from_html(self, card_element):
        """Extract product data from HTML card element"""
        try:
            name_elem = card_element.find('div', class_=re.compile(r'Product__ProductName'))
            price_elem = card_element.find('div', class_=re.compile(r'Product__ProductPrice'))
            if name_elem and price_elem:
                price_text = price_elem.get_text(strip=True)
                price = float(re.sub(r'[^\d.]', '', price_text))
                return {
                    'date': datetime.now(),
                    'product': name_elem.get_text(strip=True),
                    'price': price,
                    'quantity': 100,
                    'stock': 100,
                    'temperature': 0,
                    'rainfall': 0,
                    'source': 'blinkit'
                }
        except:
            return None
    def fetch_fruits_and_vegetables(self):
        """
        Fetch all fruits and vegetables from Blinkit.
        Returns:
            List of product records
        """
        all_products = []
        categories = [
            '/cn/fruits-vegetables/cid/1487',
            '/cn/fresh-vegetables/cid/1488',
            '/cn/fresh-fruits/cid/1489',
        ]
        print("\n" + "=" * 60)
        print("🛒 BLINKIT DATA FETCHER")
        print("=" * 60)
        print("⚠️  Educational/Research Purpose Only")
        print("=" * 60)
        for category_url in categories:
            products = self.fetch_category_page(category_url)
            all_products.extend(products)
            print(f"⏳ Waiting {self.request_delay} seconds...")
            time.sleep(self.request_delay)
        return all_products
    def save_to_mongodb(self, products):
        """Save fetched products to MongoDB"""
        if not products:
            print("⚠️  No products to save")
            return 0
        try:
            result = self.collection.insert_many(products)
            print(f"\n✅ Saved {len(result.inserted_ids)} products to MongoDB")
            return len(result.inserted_ids)
        except Exception as e:
            print(f"❌ Failed to save to MongoDB: {str(e)}")
            return 0
    def export_to_csv(self, products, filename='blinkit_data.csv'):
        """Export products to CSV file"""
        import pandas as pd
        if not products:
            print("⚠️  No products to export")
            return
        try:
            df = pd.DataFrame(products)
            df.to_csv(filename, index=False)
            print(f"✅ Exported to {filename}")
        except Exception as e:
            print(f"❌ Export failed: {str(e)}")
    def run(self, save_to_db=True, export_csv=True):
        """
        Main method to fetch and save Blinkit data.
        Args:
            save_to_db: Save to MongoDB
            export_csv: Export to CSV file
        """
        products = self.fetch_fruits_and_vegetables()
        if products:
            print(f"\n📊 Total products fetched: {len(products)}")
            if save_to_db:
                self.save_to_mongodb(products)
            if export_csv:
                self.export_to_csv(products)
            print("\n" + "=" * 60)
            print("✅ BLINKIT DATA FETCH COMPLETE")
            print("=" * 60)
        else:
            print("\n⚠️  No products fetched")
            print("💡 Possible reasons:")
            print("   - Blinkit website structure changed")
            print("   - Network connectivity issues")
            print("   - Rate limiting or blocking")
            print("   - Invalid category URLs")
def main():
    """
    Run the Blinkit data fetcher.
    ⚠️ IMPORTANT NOTES:
    1. This is for educational/research purposes only
    2. Check Blinkit's Terms of Service before using
    3. Use responsibly with proper rate limiting
    4. The HTML structure may change, requiring updates
    5. Consider using official APIs when available
    """
    print("\n⚠️  DISCLAIMER:")
    print("This tool is for educational/research purposes only.")
    print("Please review Blinkit's Terms of Service before proceeding.")
    print("\nDo you want to continue? (yes/no): ", end='')
    fetcher = BlinkitDataFetcher()
    fetcher.run(save_to_db=True, export_csv=True)
if __name__ == "__main__":
    main()