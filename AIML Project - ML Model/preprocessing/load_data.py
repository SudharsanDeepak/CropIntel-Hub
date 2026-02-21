from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv
load_dotenv()
def load_sales_data():
    """
    Load sales data from MongoDB instead of CSV.
    Connects to MongoDB Atlas and fetches all sales records.
    """
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    db = client["market_analyzer"]
    collection = db["sales"]
    data = list(collection.find())
    if not data:
        return pd.DataFrame()
    df = pd.DataFrame(data)
    if "_id" in df.columns:
        df.drop(columns=["_id"], inplace=True)
    if "quantity" in df.columns:
        df.rename(columns={"quantity": "demand"}, inplace=True)
    return df