"""
Comprehensive Market Data Fetcher for 180+ Fruits & Vegetables
Fetches real-time retail prices standardized to ₹/kg
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import time
import json
import re
load_dotenv()
class ComprehensiveMarketFetcher:
    """
    Fetches real-time market data for 180+ fruits and vegetables.
    All prices standardized to ₹/kg retail price.
    """
    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client["market_analyzer"]
        self.collection = self.db["sales"]
        self.products = {
            'fruits': [
                'Apple', 'Banana', 'Mango', 'Orange', 'Papaya', 'Pineapple', 'Guava', 
                'Watermelon', 'Muskmelon', 'Pomegranate', 'Grapes', 'Sapota', 
                'Custard Apple', 'Jackfruit', 'Lychee', 'Strawberry', 'Blueberry', 
                'Blackberry', 'Pear', 'Peach', 'Plum', 'Apricot', 'Kiwi', 'Dragon Fruit',
                'Passion Fruit', 'Fig', 'Dates', 'Coconut', 'Tender Coconut', 'Sweet Lime',
                'Amla', 'Jamun', 'Karonda', 'Wood Apple', 'Star Fruit', 'Mulberry',
                'Rambutan', 'Avocado', 'Persimmon', 'Cherry', 'Mandarin', 'Tamarind',
                'Palm Fruit', 'Ber', 'Rose Apple', 'Sugarcane', 'Grapefruit', 'Cranberry',
                'Longan', 'Durian', 'Olives', 'Soursop', 'Mangosteen', 'Gooseberry',
                'Custard Pear', 'Indian Fig', 'Quince', 'Breadfruit', 'Kumquat',
                'Cantaloupe', 'Honeydew Melon', 'Nectarine', 'Pomelo', 'Red Banana',
                'Plantain', 'Kinnow', 'Langsat', 'Loquat', 'Miracle Fruit', 'Snake Fruit',
                'Indian Blackberry', 'Indian Plum', 'Indian Almond Fruit', 'Bilimbi',
                'Ceylon Gooseberry', 'Malay Apple', 'Indian Mulberry', 'Santol',
                'Sapodilla', 'Indian Persimmon', 'Wild Mango', 'Hog Plum', 'Indian Bael Fruit',
                'Elephant Apple', 'Phalsa', 'Indian Cherry', 'Tadgola', 'Water Apple',
                'Indian Fig Fruit', 'Gunda Fruit'
            ],
            'vegetables': [
                'Potato', 'Tomato', 'Onion', 'Garlic', 'Ginger', 'Carrot', 'Cabbage',
                'Cauliflower', 'Brinjal', 'Capsicum', 'Green Chilli', 'Cucumber',
                'Bottle Gourd', 'Ridge Gourd', 'Bitter Gourd', 'Snake Gourd', 'Ash Gourd',
                'Pumpkin', 'Radish', 'Turnip', 'Beetroot', 'Drumstick', 'Cluster Beans',
                'French Beans', 'Broad Beans', 'Green Peas', 'Chow Chow', 'Raw Banana',
                'Taro Root', 'Sweet Potato', 'Yam', 'Colocasia Leaves', 'Spinach',
                'Fenugreek Leaves', 'Amaranth Leaves', 'Coriander Leaves', 'Mint Leaves',
                'Curry Leaves', 'Spring Onion', 'Lettuce', 'Broccoli', 'Zucchini',
                'Mushroom', 'Corn', 'Baby Corn', 'Lady Finger', 'Ivy Gourd', 'Pointed Gourd',
                'Sponge Gourd', 'Knol Khol', 'Raw Papaya', 'Raw Mango', 'Green Gram Sprouts',
                'Black Gram Sprouts', 'Chickpeas', 'Horse Gram', 'Field Beans',
                'Drumstick Leaves', 'Red Cabbage', 'Yellow Capsicum', 'Red Capsicum',
                'Green Beans', 'Celery', 'Leek', 'Parsley', 'Basil', 'Dill Leaves',
                'Mustard Greens', 'Turnip Greens', 'Radish Leaves', 'Kale', 'Bok Choy',
                'Arugula', 'Water Spinach', 'Malabar Spinach', 'Shepu', 'Sorrel Leaves',
                'Ridge Gourd Leaves', 'Pumpkin Leaves', 'Banana Flower', 'Banana Stem',
                'Lotus Root', 'Green Garlic', 'Pearl Onion', 'Shallots', 'White Radish',
                'Purple Cabbage', 'Raw Jackfruit', 'Green Soybeans', 'Brussels Sprouts'
            ]
        }
        self.price_ranges = {
            'premium': (150, 300),
            'high': (80, 150),
            'medium': (40, 80),
            'low': (20, 40),
            'very_low': (10, 20)
        }
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    def fetch_bigbasket_prices(self, product_name):
        """Fetch retail prices from BigBasket"""
        try:
            search_url = f"https://www.bigbasket.com/ps/?q={product_name.replace(' ', '%20')}"
            response = requests.get(search_url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                products = soup.find_all('div', class_=re.compile(r'product'))
                if products:
                    for product in products[:3]:  # Check first 3 results
                        try:
                            price_elem = product.find('span', class_=re.compile(r'price'))
                            weight_elem = product.find('span', class_=re.compile(r'weight|unit'))
                            if price_elem and weight_elem:
                                price = self._extract_price(price_elem.text)
                                weight_kg = self._convert_to_kg(weight_elem.text)
                                if price and weight_kg:
                                    price_per_kg = price / weight_kg
                                    return {
                                        'price_per_kg': round(price_per_kg, 2),
                                        'source': 'bigbasket',
                                        'confidence': 'high'
                                    }
                        except:
                            continue
            return None
        except Exception as e:
            print(f"   ⚠️  BigBasket error: {str(e)}")
            return None
    def fetch_jiomart_prices(self, product_name):
        """Fetch retail prices from JioMart"""
        try:
            search_url = f"https://www.jiomart.com/search/{product_name.replace(' ', '-')}"
            response = requests.get(search_url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                products = soup.find_all('div', class_=re.compile(r'product'))
                if products:
                    for product in products[:3]:
                        try:
                            price_elem = product.find('span', class_=re.compile(r'price'))
                            weight_elem = product.find('span', class_=re.compile(r'weight'))
                            if price_elem and weight_elem:
                                price = self._extract_price(price_elem.text)
                                weight_kg = self._convert_to_kg(weight_elem.text)
                                if price and weight_kg:
                                    return {
                                        'price_per_kg': round(price / weight_kg, 2),
                                        'source': 'jiomart',
                                        'confidence': 'high'
                                    }
                        except:
                            continue
            return None
        except Exception as e:
            print(f"   ⚠️  JioMart error: {str(e)}")
            return None
    def fetch_agmarknet_wholesale(self, product_name):
        """Fetch wholesale prices from Agmarknet and estimate retail"""
        try:
            url = "https://agmarknet.gov.in/SearchCmmMkt.aspx"
            params = {'Tx_Commodity': product_name}
            response = requests.get(url, params=params, headers=self.headers, timeout=15)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                table = soup.find('table', {'id': re.compile(r'GridPriceData')})
                if table:
                    rows = table.find_all('tr')[1:6]  # Get first 5 markets
                    prices = []
                    for row in rows:
                        cols = row.find_all('td')
                        if len(cols) >= 5:
                            modal_price = self._extract_price(cols[4].text)
                            if modal_price:
                                prices.append(modal_price)
                    if prices:
                        avg_wholesale = sum(prices) / len(prices)
                        retail_price = avg_wholesale * 1.4  # 40% markup
                        return {
                            'price_per_kg': round(retail_price, 2),
                            'source': 'agmarknet_estimated',
                            'confidence': 'medium'
                        }
            return None
        except Exception as e:
            print(f"   ⚠️  Agmarknet error: {str(e)}")
            return None
    def estimate_price_by_category(self, product_name):
        """Estimate price based on product category"""
        product_lower = product_name.lower()
        premium_keywords = ['avocado', 'blueberry', 'blackberry', 'dragon fruit', 'kiwi', 
                           'strawberry', 'cherry', 'durian', 'rambutan', 'passion fruit',
                           'brussels sprouts', 'broccoli', 'zucchini', 'asparagus']
        high_keywords = ['mango', 'pomegranate', 'grapes', 'apple', 'pear', 'peach',
                        'mushroom', 'capsicum', 'bell pepper']
        low_keywords = ['potato', 'onion', 'tomato', 'cabbage', 'cauliflower', 'radish']
        leafy_keywords = ['spinach', 'coriander', 'mint', 'curry leaves', 'fenugreek',
                         'amaranth', 'leaves']
        if any(keyword in product_lower for keyword in premium_keywords):
            category = 'premium'
        elif any(keyword in product_lower for keyword in high_keywords):
            category = 'high'
        elif any(keyword in product_lower for keyword in low_keywords):
            category = 'low'
        elif any(keyword in product_lower for keyword in leafy_keywords):
            category = 'very_low'
        else:
            category = 'medium'
        min_price, max_price = self.price_ranges[category]
        estimated_price = (min_price + max_price) / 2
        return {
            'price_per_kg': round(estimated_price, 2),
            'source': 'estimated',
            'confidence': 'low',
            'category': category
        }
    def _extract_price(self, price_str):
        """Extract numeric price from string"""
        try:
            numbers = re.findall(r'\d+\.?\d*', price_str.replace(',', ''))
            if numbers:
                return float(numbers[0])
            return None
        except:
            return None
    def _convert_to_kg(self, weight_str):
        """Convert weight string to kg"""
        try:
            weight_str = weight_str.lower()
            numbers = re.findall(r'\d+\.?\d*', weight_str)
            if not numbers:
                return 1.0
            value = float(numbers[0])
            if 'kg' in weight_str:
                return value
            elif 'g' in weight_str or 'gm' in weight_str or 'gram' in weight_str:
                return value / 1000
            elif 'l' in weight_str or 'ltr' in weight_str or 'litre' in weight_str:
                return value
            elif 'piece' in weight_str or 'pc' in weight_str:
                return 0.5
            else:
                return 1.0
        except:
            return 1.0
    def fetch_product_price(self, product_name):
        """
        Fetch price for a single product from multiple sources.
        Returns standardized ₹/kg retail price.
        """
        print(f"   🔍 Fetching: {product_name}")
        sources = [
            ('BigBasket', self.fetch_bigbasket_prices),
            ('JioMart', self.fetch_jiomart_prices),
            ('Agmarknet', self.fetch_agmarknet_wholesale)
        ]
        for source_name, fetch_func in sources:
            try:
                result = fetch_func(product_name)
                if result and result['price_per_kg'] > 0:
                    print(f"      ✅ {source_name}: ₹{result['price_per_kg']}/kg")
                    return result
            except Exception as e:
                continue
            time.sleep(1)
        result = self.estimate_price_by_category(product_name)
        print(f"      📊 Estimated: ₹{result['price_per_kg']}/kg ({result['category']})")
        return result
    def fetch_all_products(self):
        """Fetch prices for all 180 products"""
        all_records = []
        print("\n" + "=" * 70)
        print("🛒 COMPREHENSIVE MARKET DATA FETCHER")
        print("=" * 70)
        print(f"📦 Total Products: {len(self.products['fruits']) + len(self.products['vegetables'])}")
        print("💰 All prices standardized to ₹/kg retail price")
        print("=" * 70)
        print("\n🍎 FETCHING FRUITS...")
        print("-" * 70)
        for i, product in enumerate(self.products['fruits'], 1):
            print(f"\n[{i}/{len(self.products['fruits'])}] {product}")
            price_data = self.fetch_product_price(product)
            record = {
                'date': datetime.now(),
                'product': product,
                'category': 'fruit',
                'price': price_data['price_per_kg'],
                'unit': 'kg',
                'quantity': 100,  # Default stock
                'stock': 100,
                'temperature': 0,
                'rainfall': 0,
                'source': price_data['source'],
                'confidence': price_data['confidence']
            }
            all_records.append(record)
            time.sleep(2)  # Rate limiting
        print("\n\n🥬 FETCHING VEGETABLES...")
        print("-" * 70)
        for i, product in enumerate(self.products['vegetables'], 1):
            print(f"\n[{i}/{len(self.products['vegetables'])}] {product}")
            price_data = self.fetch_product_price(product)
            record = {
                'date': datetime.now(),
                'product': product,
                'category': 'vegetable',
                'price': price_data['price_per_kg'],
                'unit': 'kg',
                'quantity': 100,
                'stock': 100,
                'temperature': 0,
                'rainfall': 0,
                'source': price_data['source'],
                'confidence': price_data['confidence']
            }
            all_records.append(record)
            time.sleep(2)  # Rate limiting
        return all_records
    def save_to_mongodb(self, records):
        """Save records to MongoDB"""
        if not records:
            print("⚠️  No records to save")
            return 0
        try:
            self.collection.delete_many({})
            print(f"\n🗑️  Cleared old data")
            result = self.collection.insert_many(records)
            print(f"✅ Saved {len(result.inserted_ids)} records to MongoDB")
            return len(result.inserted_ids)
        except Exception as e:
            print(f"❌ MongoDB error: {str(e)}")
            return 0
    def export_to_csv(self, records, filename='market_data_180_products.csv'):
        """Export to CSV"""
        if not records:
            return
        try:
            df = pd.DataFrame(records)
            df.to_csv(filename, index=False)
            print(f"✅ Exported to {filename}")
            print("\n📊 PRICE SUMMARY:")
            print("-" * 70)
            print(f"Total Products: {len(df)}")
            print(f"Fruits: {len(df[df['category'] == 'fruit'])}")
            print(f"Vegetables: {len(df[df['category'] == 'vegetable'])}")
            print(f"\nPrice Range: ₹{df['price'].min():.2f} - ₹{df['price'].max():.2f} per kg")
            print(f"Average Price: ₹{df['price'].mean():.2f} per kg")
            print(f"Median Price: ₹{df['price'].median():.2f} per kg")
            print("\n🏆 TOP 10 MOST EXPENSIVE:")
            top_10 = df.nlargest(10, 'price')[['product', 'price', 'source']]
            for idx, row in top_10.iterrows():
                print(f"   {row['product']}: ₹{row['price']:.2f}/kg ({row['source']})")
            print("\n💰 TOP 10 CHEAPEST:")
            bottom_10 = df.nsmallest(10, 'price')[['product', 'price', 'source']]
            for idx, row in bottom_10.iterrows():
                print(f"   {row['product']}: ₹{row['price']:.2f}/kg ({row['source']})")
        except Exception as e:
            print(f"❌ Export error: {str(e)}")
    def run(self):
        """Main execution"""
        start_time = datetime.now()
        records = self.fetch_all_products()
        if records:
            self.save_to_mongodb(records)
            self.export_to_csv(records)
            duration = (datetime.now() - start_time).total_seconds()
            print("\n" + "=" * 70)
            print("✅ FETCH COMPLETE")
            print("=" * 70)
            print(f"⏱️  Duration: {duration:.2f} seconds")
            print(f"📦 Products: {len(records)}")
            print(f"💾 Saved to MongoDB: market_analyzer.sales")
            print(f"📄 Exported to: market_data_180_products.csv")
            print("=" * 70)
        else:
            print("\n❌ No data fetched")
def main():
    """Run the comprehensive market fetcher"""
    fetcher = ComprehensiveMarketFetcher()
    fetcher.run()
if __name__ == "__main__":
    main()