"""
EMERGENCY PRICE FIX
This script rebuilds MongoDB sales data with realistic prices for the
full 180-product catalog and provides a safer fallback for unknown items.
"""
from datetime import datetime, timedelta
import os
import random
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

try:
    from data_sources.comprehensive_market_fetcher import ComprehensiveMarketFetcher
except Exception:
    ComprehensiveMarketFetcher = None

load_dotenv()

PRODUCT_PRICE_RANGES = {
    "Apple": (140, 220),
    "Green Apple": (140, 220),
    "Red Apple": (140, 220),
    "Gala Apple": (140, 220),
    "Fuji Apple": (140, 220),
    "Granny Smith": (140, 220),
    "Honeycrisp": (150, 240),
    "Golden Delicious": (140, 220),
    "Banana": (50, 80),
    "Cavendish Banana": (50, 80),
    "Red Banana": (55, 85),
    "Baby Banana": (55, 85),
    "Plantain": (45, 75),
    "Mango": (80, 180),
    "Orange": (60, 100),
    "Navel Orange": (60, 100),
    "Blood Orange": (70, 110),
    "Mandarin": (70, 120),
    "Tangerine": (70, 120),
    "Clementine": (70, 120),
    "Satsuma": (70, 120),
    "Lemon": (50, 90),
    "Lime": (50, 90),
    "Papaya": (40, 70),
    "Pineapple": (50, 90),
    "Guava": (50, 80),
    "Watermelon": (25, 50),
    "Muskmelon": (40, 70),
    "Pomegranate": (150, 280),
    "Grapes": (80, 160),
    "Grape": (80, 160),
    "Green Grape": (90, 170),
    "Red Grape": (90, 170),
    "Black Grape": (100, 180),
    "Seedless Grape": (90, 170),
    "Cotton Candy Grape": (120, 220),
    "Grapefruit": (70, 130),
    "Sapota": (50, 90),
    "Custard Apple": (80, 140),
    "Jackfruit": (40, 80),
    "Lychee": (150, 250),
    "Strawberry": (300, 500),
    "Blueberry": (600, 1000),
    "Blackberry": (400, 700),
    "Pear": (120, 200),
    "Peach": (150, 250),
    "Plum": (180, 280),
    "Apricot": (200, 350),
    "Kiwi": (250, 400),
    "Dragon Fruit": (200, 350),
    "Passion Fruit": (250, 400),
    "Fig": (400, 600),
    "Dates": (350, 550),
    "Coconut": (40, 70),
    "Tender Coconut": (50, 80),
    "Sweet Lime": (50, 90),
    "Amla": (50, 100),
    "Jamun": (80, 140),
    "Karonda": (60, 110),
    "Wood Apple": (50, 90),
    "Star Fruit": (100, 180),
    "Mulberry": (150, 250),
    "Rambutan": (250, 400),
    "Avocado": (350, 550),
    "Persimmon": (200, 320),
    "Cherry": (500, 800),
    "Potato": (25, 45),
    "Tomato": (30, 80),
    "Onion": (25, 60),
    "Red Onion": (25, 60),
    "White Onion": (30, 65),
    "Yellow Onion": (25, 60),
    "Garlic": (100, 180),
    "Ginger": (80, 150),
    "Carrot": (40, 75),
    "Cabbage": (25, 50),
    "Cauliflower": (40, 80),
    "Brinjal": (40, 75),
    "Capsicum": (80, 150),
    "Green Chilli": (50, 120),
    "Cucumber": (30, 60),
    "Bottle Gourd": (30, 60),
    "Ridge Gourd": (40, 70),
    "Bitter Gourd": (45, 80),
    "Snake Gourd": (40, 70),
    "Ash Gourd": (25, 50),
    "Pumpkin": (25, 50),
    "Radish": (30, 60),
    "Turnip": (40, 70),
    "Beetroot": (45, 80),
    "Drumstick": (50, 100),
    "Cluster Beans": (50, 95),
    "French Beans": (60, 110),
    "Broad Beans": (80, 130),
    "Green Peas": (60, 120),
    "Chow Chow": (40, 70),
    "Raw Banana": (30, 60),
    "Taro Root": (45, 80),
    "Sweet Potato": (40, 75),
    "Yam": (50, 95),
    "Spinach": (25, 50),
    "Fenugreek Leaves": (30, 65),
    "Coriander Leaves": (40, 80),
    "Mint Leaves": (50, 100),
    "Curry Leaves": (60, 120),
    "Spring Onion": (50, 95),
    "Lettuce": (80, 150),
    "Broccoli": (100, 180),
    "Zucchini": (90, 160),
    "Mushroom": (200, 350),
    "Corn": (40, 80),
    "Baby Corn": (120, 220),
    "Lady Finger": (45, 90),
    "Brussels Sprouts": (150, 280),
}

FRUIT_KEYWORDS = [
    "apple", "banana", "mango", "orange", "papaya", "pineapple", "guava",
    "watermelon", "muskmelon", "pomegranate", "grape", "sapota",
    "custard apple", "jackfruit", "lychee", "pear", "peach", "plum",
    "apricot", "kiwi", "dragon fruit", "passion fruit", "avocado",
    "coconut", "dates", "fig", "mulberry", "rambutan", "persimmon",
    "cherry", "amla", "jamun", "karonda", "wood apple", "star fruit",
    "sweet lime", "tender coconut", "lemon", "lime", "mandarin",
    "tangerine", "clementine", "satsuma", "plantain", "granny smith",
    "honeycrisp", "golden delicious"
]

LEAFY_KEYWORDS = [
    "spinach", "leaves", "greens", "coriander", "mint", "curry",
    "fenugreek", "lettuce", "basil", "parsley", "dill", "thyme",
    "oregano", "arugula", "watercress", "endive", "radicchio",
    "kale", "chard", "mustard"
]

PREMIUM_VEGETABLE_KEYWORDS = [
    "broccoli", "zucchini", "asparagus", "artichoke", "brussels sprouts",
    "mushroom", "baby corn", "bell pepper", "capsicum", "leek", "celery"
]

STAPLE_VEGETABLE_KEYWORDS = [
    "tomato", "potato", "onion", "carrot", "cabbage", "cauliflower",
    "brinjal", "cucumber", "radish", "turnip", "beetroot", "pumpkin",
    "okra", "lady finger", "garlic", "ginger", "chilli", "chili",
    "drumstick", "beans", "peas", "banana stem", "banana flower"
]


def get_canonical_products():
    if ComprehensiveMarketFetcher is None:
        return sorted(PRODUCT_PRICE_RANGES.keys())

    try:
        return list(ComprehensiveMarketFetcher().products_180)
    except Exception:
        return sorted(PRODUCT_PRICE_RANGES.keys())


def infer_category(product_name):
    lower_name = product_name.lower()
    if any(keyword in lower_name for keyword in STAPLE_VEGETABLE_KEYWORDS):
        return "vegetable"
    if any(keyword in lower_name for keyword in PREMIUM_VEGETABLE_KEYWORDS):
        return "vegetable"
    if any(keyword in lower_name for keyword in LEAFY_KEYWORDS):
        return "vegetable"
    return "fruit" if any(keyword in lower_name for keyword in FRUIT_KEYWORDS) else "vegetable"


def infer_price_range(product_name):
    if product_name in PRODUCT_PRICE_RANGES:
        return PRODUCT_PRICE_RANGES[product_name]

    lower_name = product_name.lower()

    if any(keyword in lower_name for keyword in STAPLE_VEGETABLE_KEYWORDS):
        return (25, 90)

    if any(keyword in lower_name for keyword in PREMIUM_VEGETABLE_KEYWORDS):
        return (80, 220)

    if any(keyword in lower_name for keyword in LEAFY_KEYWORDS):
        return (25, 80)

    if any(keyword in lower_name for keyword in ["blueberry", "blackberry", "cherry", "fig", "dates"]):
        return (400, 800)

    if any(keyword in lower_name for keyword in ["grape", "grapefruit"]):
        return (80, 180)

    if any(keyword in lower_name for keyword in ["avocado", "kiwi", "dragon fruit", "passion fruit", "rambutan"]):
        return (200, 450)

    if any(keyword in lower_name for keyword in ["apple", "pear", "peach", "plum", "apricot", "pomegranate", "lychee"]):
        return (120, 250)


    if any(keyword in lower_name for keyword in ["gourd", "tori", "lauki", "ghiya", "parwal", "karela", "kundru", "tinda"]):
        return (30, 80)

    if any(keyword in lower_name for keyword in ["bean", "peas", "gram", "cowpea"]):
        return (50, 130)

    return (40, 120) if infer_category(product_name) == "vegetable" else (70, 180)


def build_price(product_name):
    min_price, max_price = infer_price_range(product_name)
    return round((min_price + max_price) / 2 * random.uniform(0.9, 1.1), 2)


def fix_database():
    """Fix all prices in MongoDB."""
    print("\n" + "=" * 70)
    print("🚨 EMERGENCY PRICE FIX - RUNNING NOW")
    print("=" * 70)

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("❌ ERROR: MONGO_URI not found in .env file")
        return False

    try:
        print("\n🔄 Connecting to MongoDB...")
        print(f"   URI: {mongo_uri[:50]}...")
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            retryWrites=True,
            w="majority",
        )
        client.admin.command("ping")
        db = client["market_analyzer"]
        collection = db["sales"]
        print("✅ Connected")

        print("\n🗑️  Clearing ALL existing data...")
        result = collection.delete_many({})
        print(f"✅ Deleted {result.deleted_count} old records")

        canonical_products = get_canonical_products()
        print(f"\n📊 Generating realistic data for {len(canonical_products)} products...")
        records = []
        current_date = datetime.now()

        for product in canonical_products:
            category = infer_category(product)
            base_price = build_price(product)

            for days_ago in range(30):
                date = current_date - timedelta(days=days_ago)
                price = base_price * random.uniform(0.9, 1.1)
                base_demand = 150 - (price / 5)
                demand = max(50, base_demand + random.uniform(-20, 20))

                records.append({
                    "date": date,
                    "product": product,
                    "category": category,
                    "price": round(price, 2),
                    "predicted_price": round(price, 2),
                    "quantity": round(demand, 1),
                    "predicted_demand": round(demand, 1),
                    "demand": round(demand, 1),
                    "stock": random.randint(80, 200),
                    "temperature": random.randint(20, 35),
                    "rainfall": random.randint(0, 50),
                    "unit": "kg",
                    "source": "emergency_fix",
                    "confidence": "high",
                })

        print(f"✅ Created {len(records)} records for {len(canonical_products)} products")

        print("\n💾 Inserting into MongoDB...")
        result = collection.insert_many(records)
        print(f"✅ Inserted {len(result.inserted_ids)} records")

        print("\n📊 VERIFICATION:")
        print("-" * 70)

        pipeline = [{
            "$group": {
                "_id": None,
                "avg_price": {"$avg": "$price"},
                "min_price": {"$min": "$price"},
                "max_price": {"$max": "$price"},
                "count": {"$sum": 1},
            }
        }]

        stats = list(collection.aggregate(pipeline))[0]

        print(f"   Total Records: {stats['count']}")
        print(f"   Products: {len(canonical_products)}")
        print(f"   Avg Price: ₹{stats['avg_price']:.2f}/kg")
        print(f"   Price Range: ₹{stats['min_price']:.2f} - ₹{stats['max_price']:.2f}/kg")

        print("\n💰 SAMPLE PRICES:")
        print("-" * 70)
        samples = ["Tomato", "Potato", "Onion", "Apple", "Banana", "Strawberry", "Blueberry", "Mushroom"]
        for product in samples:
            min_price, max_price = infer_price_range(product)
            print(f"   {product:15s}: ₹{((min_price + max_price) / 2):.2f}/kg")

        print("\n" + "=" * 70)
        print("✅ DATABASE FIXED SUCCESSFULLY!")
        print("=" * 70)
        print("\n📝 NEXT STEPS:")
        print("   1. Restart the ML API (if running)")
        print("   2. Restart the Backend Server (if running)")
        print("   3. Refresh your browser (Ctrl + F5)")
        print("   4. Check the dashboard with the updated product catalog")
        print("\n")

        client.close()
        return True

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        return False


if __name__ == "__main__":
    success = fix_database()
    if success:
        print("✅ Fix completed successfully!")
        print("\nPlease restart your servers and refresh the browser.")
    else:
        print("❌ Fix failed. Please check the error messages above.")

