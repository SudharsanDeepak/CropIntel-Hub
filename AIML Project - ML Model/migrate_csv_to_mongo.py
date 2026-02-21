"""
Migration script to transfer CSV data to MongoDB.
Run this once to populate MongoDB with existing CSV data.
"""
import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
def migrate_csv_to_mongodb():
    """
    Reads sales_data.csv and inserts all records into MongoDB.
    """
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    db = client["market_analyzer"]
    collection = db["sales"]
    collection.delete_many({})
    print("Cleared existing MongoDB data")
    df = pd.read_csv("data/sales_data.csv")
    df.rename(columns={"demand": "quantity"}, inplace=True)
    records = df.to_dict(orient="records")
    result = collection.insert_many(records)
    print(f"✅ Successfully migrated {len(result.inserted_ids)} records to MongoDB")
    print(f"Database: market_analyzer")
    print(f"Collection: sales")
if __name__ == "__main__":
    migrate_csv_to_mongodb()