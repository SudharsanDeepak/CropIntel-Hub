from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from forecasting.forecast_generator import generate_forecast
from pricing.price_forecast_generator import generate_price_forecast
from optimization.stock_optimizer import optimize_stock
from pricing.elasticity import calculate_elasticity
load_dotenv()
app = FastAPI(title="Market Intelligence ML API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
mongo_client = MongoClient(mongo_uri)
db = mongo_client["market_analyzer"]
collection = db["sales"]
@app.get("/")
def health_check():
    return {"status": "ML Service Running", "data_source": "Real-time Market Data + MongoDB"}
@app.get("/products/latest")
def get_latest_products(
    limit: Optional[int] = Query(None, description="Limit number of products"),
    category: Optional[str] = Query(None, description="Filter by category: fruit or vegetable"),
    search: Optional[str] = Query(None, description="Search by product name")
):
    """
    Fast endpoint to get latest prices for all products.
    No ML processing - just raw data from database.
    """
    try:
        pipeline = [
            {"$sort": {"date": -1}},
            {
                "$group": {
                    "_id": "$product",
                    "product": {"$first": "$product"},
                    "category": {"$first": "$category"},
                    "price": {"$first": "$price"},
                    "quantity": {"$first": "$quantity"},
                    "stock": {"$first": "$stock"},
                    "date": {"$first": "$date"},
                    "source": {"$first": "$source"}
                }
            }
        ]
        if category:
            pipeline.insert(0, {"$match": {"category": category}})
        if search:
            pipeline.insert(0, {"$match": {"product": {"$regex": search, "$options": "i"}}})
        results = list(collection.aggregate(pipeline))
        if limit:
            results = results[:limit]
        products = []
        for item in results:
            products.append({
                "product": item["product"],
                "category": item.get("category", "fruit"),
                "price": float(item["price"]),
                "predicted_demand": float(item.get("quantity", 100)),
                "stock": int(item.get("stock", 100)),
                "date": item["date"].isoformat() if isinstance(item["date"], datetime) else str(item["date"]),
                "source": item.get("source", "database")
            })
        return products
    except Exception as e:
        return {"error": str(e), "products": []}
@app.get("/products/{product_name}/forecast")
def get_product_forecast(product_name: str, days: int = 7):
    """
    Fast endpoint to get forecast for a specific product.
    Only processes one product at a time.
    """
    try:
        historical = list(collection.find(
            {"product": product_name}
        ).sort("date", -1).limit(30))
        if not historical:
            return {"error": "Product not found", "forecasts": []}
        price_pipeline = [
            {"$match": {"product": product_name}},
            {"$sort": {"date": -1}},
            {"$limit": days}
        ]
        price_data = list(collection.aggregate(price_pipeline))
        forecasts = []
        for item in price_data:
            forecasts.append({
                "date": item["date"].isoformat() if isinstance(item["date"], datetime) else str(item["date"]),
                "predicted_price": float(item["price"]),
                "predicted_demand": float(item.get("quantity", 100)),
                "product": product_name
            })
        return forecasts
    except Exception as e:
        return {"error": str(e), "forecasts": []}
@app.get("/forecast/demand")
def demand(days: int = 7):
    data = generate_forecast(days)
    return data.to_dict(orient="records")
@app.get("/forecast/price")
def price(days: int = 7):
    data = generate_price_forecast(days)
    return data.to_dict(orient="records")
@app.get("/analysis/stock")
def stock(days: int = 7):
    data = optimize_stock(days)
    return data.to_dict(orient="records")
@app.get("/analysis/elasticity")
def elasticity():
    data = calculate_elasticity()
    return data.to_dict(orient="records")
@app.post("/data/update")
def update_market_data():
    """
    Manually trigger market data update from external APIs.
    """
    try:
        from data_sources.api_fetcher import MarketDataFetcher
        fetcher = MarketDataFetcher()
        records = fetcher.fetch_all_products()
        saved_count = fetcher.save_to_mongodb(records)
        return {
            "status": "success",
            "message": f"Updated {saved_count} records from real-time sources",
            "records_fetched": len(records),
            "records_saved": saved_count
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
@app.get("/data/sources")
def get_data_sources():
    """
    Get information about available data sources.
    """
    return {
        "sources": [
            {
                "name": "Agmarknet",
                "type": "Government API",
                "country": "India",
                "status": "active",
                "requires_key": True
            },
            {
                "name": "USDA Market News",
                "type": "Government API",
                "country": "USA",
                "status": "active",
                "requires_key": False
            },
            {
                "name": "Open Food Facts",
                "type": "Open Data",
                "country": "Global",
                "status": "active",
                "requires_key": False
            },
            {
                "name": "MongoDB",
                "type": "Database",
                "status": "active",
                "description": "Historical and cached data"
            }
        ]
    }
@app.get("/data/quality")
def check_data_quality():
    """
    Check data quality and freshness.
    """
    try:
        from data_sources.data_quality_checker import DataQualityChecker
        checker = DataQualityChecker()
        return {
            "freshness": checker.check_data_freshness(),
            "completeness": checker.check_data_completeness(),
            "sources": checker.check_data_sources(),
            "statistics": checker.get_statistics()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }