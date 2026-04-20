"""Canonical product price and category helpers for market data generation."""

import random
from datetime import datetime

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
    "Alphonso Mango": (120, 240),
    "Kesar Mango": (110, 220),
    "Dasheri Mango": (100, 200),
    "Langra Mango": (100, 200),
    "Totapuri Mango": (90, 180),
    "Badami Mango": (100, 200),
    "Chausa Mango": (100, 200),
    "Safeda Mango": (90, 180),
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
    "Red Potato": (30, 50),
    "White Potato": (25, 45),
    "Yellow Potato": (28, 48),
    "Russet Potato": (35, 60),
    "Fingerling Potato": (35, 60),
    "Tomato": (30, 80),
    "Cherry Tomato": (80, 150),
    "Roma Tomato": (30, 80),
    "Beefsteak Tomato": (40, 90),
    "Heirloom Tomato": (40, 90),
    "Carrot": (40, 75),
    "Baby Carrot": (45, 80),
    "Cabbage": (25, 50),
    "Red Cabbage": (35, 65),
    "Savoy Cabbage": (35, 65),
    "Chinese Cabbage": (40, 75),
    "Napa Cabbage": (40, 75),
    "Cauliflower": (40, 80),
    "Purple Cauliflower": (45, 85),
    "Broccoflower": (45, 85),
    "Brinjal": (40, 75),
    "Cucumber": (30, 60),
    "Radish": (30, 60),
    "White Radish": (30, 60),
    "Black Radish": (35, 65),
    "Red Radish": (30, 60),
    "Daikon": (35, 65),
    "Beetroot": (45, 80),
    "Pumpkin": (25, 50),
    "Spinach": (25, 50),
    "Lady Finger": (45, 90),
    "Okra": (45, 90),
    "Karela": (45, 80),
    "Bottle Gourd": (30, 60),
    "Lauki": (30, 60),
    "Ridge Gourd": (40, 70),
    "Torai": (40, 70),
    "Bitter Gourd": (45, 80),
    "Snake Gourd": (40, 70),
    "Ash Gourd": (25, 50),
    "Tori": (40, 70),
    "Parwal": (40, 75),
    "Parval": (40, 75),
    "Kundru": (40, 75),
    "Tinda": (35, 65),
    "Arbi": (45, 80),
    "Jimikand": (45, 85),
    "Suran": (50, 95),
    "Sweet Potato": (40, 75),
    "Yam": (50, 95),
    "Tapioca": (35, 70),
    "Colocasia": (45, 80),
    "Colocasia Leaves": (30, 60),
    "Amaranth Leaves": (25, 55),
    "Coriander Leaves": (40, 80),
    "Mint Leaves": (50, 100),
    "Curry Leaves": (60, 120),
    "Fenugreek Leaves": (30, 65),
    "Mustard Leaves": (25, 55),
    "Parsley": (50, 100),
    "Basil": (50, 100),
    "Dill": (45, 90),
    "Rosemary": (50, 100),
    "Thyme": (50, 100),
    "Oregano": (50, 100),
    "Arugula": (40, 80),
    "Watercress": (40, 80),
    "Endive": (45, 85),
    "Radicchio": (40, 80),
    "Kale": (50, 90),
    "Collard Greens": (40, 80),
    "Bok Choy": (40, 80),
    "Celery": (45, 90),
    "Leek": (45, 90),
    "Shallot": (70, 140),
    "Spring Onion": (50, 95),
    "Chives": (40, 80),
    "Scallion": (40, 80),
    "Fennel": (40, 80),
    "Asparagus": (100, 180),
    "Artichoke": (100, 180),
    "Brussels Sprouts": (150, 280),
    "Broccoli": (100, 180),
    "Zucchini": (90, 160),
    "Mushroom": (200, 350),
    "Baby Corn": (120, 220),
    "Sweet Corn": (40, 80),
    "Corn on Cob": (40, 80),
    "Corn": (40, 80),
    "Bell Pepper Green": (80, 150),
    "Bell Pepper Yellow": (80, 150),
    "Bell Pepper Red": (80, 150),
    "Capsicum": (80, 150),
    "Green Chilli": (50, 120),
    "Jalapeno": (50, 100),
    "Habanero": (70, 130),
    "Serrano": (50, 100),
    "Poblano": (50, 100),
    "Anaheim": (50, 100),
    "Cayenne": (50, 100),
    "Ginger": (80, 150),
    "Garlic": (100, 180),
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
    "honeycrisp", "golden delicious", "blood orange", "navel orange",
    "red grape", "green grape", "black grape", "seedless grape",
    "cotton candy grape", "grapefruit"
]

LEAFY_KEYWORDS = [
    "spinach", "leaves", "greens", "coriander", "mint", "curry",
    "fenugreek", "lettuce", "basil", "parsley", "dill", "thyme",
    "oregano", "arugula", "watercress", "endive", "radicchio",
    "kale", "chard", "mustard"
]

PREMIUM_VEGETABLE_KEYWORDS = [
    "broccoli", "zucchini", "asparagus", "artichoke", "brussels sprouts",
    "mushroom", "baby corn", "bell pepper", "capsicum", "leek", "celery",
    "fennel", "scallion", "chives"
]

STAPLE_VEGETABLE_KEYWORDS = [
    "tomato", "potato", "onion", "carrot", "cabbage", "cauliflower",
    "brinjal", "cucumber", "radish", "turnip", "beetroot", "pumpkin",
    "okra", "lady finger", "garlic", "ginger", "chilli", "chili",
    "drumstick", "beans", "peas", "cowpea", "gourd", "tori", "lauki",
    "ghiya", "parwal", "karela", "kundru", "tinda", "yam", "tapioca",
    "arbi", "suran", "colocasia", "sweet potato", "corn"
]


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


def deterministic_price(product_name, day_offset=0, observed_price=None, date_seed=None):
    min_price, max_price = infer_price_range(product_name)
    midpoint = (min_price + max_price) / 2

    if observed_price is not None:
        try:
            observed_price = float(observed_price)
            if min_price <= observed_price <= max_price:
                return round(observed_price, 2)
        except Exception:
            pass

    if date_seed is None:
        date_seed = datetime.utcnow().strftime("%Y-%m-%d")

    rng = random.Random(f"{product_name}:{date_seed}:{day_offset}")
    price = midpoint * rng.uniform(0.95, 1.05)
    price = max(min_price, min(max_price, price))
    return round(price, 2)


def deterministic_quantity(product_name, day_offset=0, date_seed=None):
    if date_seed is None:
        date_seed = datetime.utcnow().strftime("%Y-%m-%d")

    rng = random.Random(f"{product_name}:quantity:{date_seed}:{day_offset}")
    return round(rng.uniform(90, 360), 1)


def deterministic_weather(product_name):
    rng = random.Random(f"{product_name}:weather")
    return {
        "temperature": round(rng.uniform(20, 32), 1),
        "rainfall": round(rng.uniform(0, 18), 1),
    }