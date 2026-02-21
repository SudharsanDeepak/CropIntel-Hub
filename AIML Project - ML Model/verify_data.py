"""Quick verification script"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv('MONGO_URI'))
db = client['market_analyzer']
print("\n" + "=" * 70)
print("📊 DATABASE VERIFICATION")
print("=" * 70)
products = db.sales.distinct('product')
print(f"\n✅ Total Products: {len(products)}")
total_records = db.sales.count_documents({})
print(f"✅ Total Records: {total_records}")
fruits = db.sales.distinct('product', {'category': 'fruit'})
vegetables = db.sales.distinct('product', {'category': 'vegetable'})
print(f"\n🍎 Fruits: {len(fruits)}")
print(f"🥬 Vegetables: {len(vegetables)}")
print("\n💰 Sample Prices (Latest):")
print("-" * 70)
sample_products = ['Apple', 'Banana', 'Mango', 'Tomato', 'Potato', 'Onion', 
                   'Mushroom', 'Avocado', 'Strawberry', 'Broccoli']
for product in sample_products:
    latest = db.sales.find_one({'product': product}, sort=[('date', -1)])
    if latest:
        print(f"   {product}: ₹{latest['price']:.2f}/kg")
print("\n" + "=" * 70)
print("✅ VERIFICATION COMPLETE")
print("=" * 70)
client.close()