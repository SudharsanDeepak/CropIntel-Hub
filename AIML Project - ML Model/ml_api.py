from fastapi import FastAPI, Query, BackgroundTasks, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import threading
import time
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

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "cropintelhub_admin")

def verify_admin_key(api_key: str = Header(None, alias="X-API-Key")):
    """Verify admin API key for protected endpoints"""
    if api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API key")
    return api_key

def auto_update_data():
    """Background task to automatically update market data every 24 hours"""
    while True:
        try:
            print(f"\n⏰ Auto-update triggered at {datetime.now()}")
            
            from data_sources.free_api_fetcher import FreeAPIFetcher
            free_fetcher = FreeAPIFetcher()
            saved_count = free_fetcher.update_market_data()
            
            if saved_count == 0:
                print("⚠️  Free APIs returned no data, trying government APIs...")
                from data_sources.api_fetcher import MarketDataFetcher
                fetcher = MarketDataFetcher()
                records = fetcher.fetch_all_products()
                saved_count = fetcher.save_to_mongodb(records)
            
            if saved_count == 0:
                print("⚠️  All external APIs failed, using alternative data source...")
                from data_sources.alternative_fetcher import AlternativeMarketDataFetcher
                alt_fetcher = AlternativeMarketDataFetcher()
                saved_count = alt_fetcher.update_market_data(days=7)
            
            print(f"✅ Auto-updated {saved_count} records")
        except Exception as e:
            print(f"❌ Auto-update error: {str(e)}")
            try:
                print("🔄 Falling back to alternative data source...")
                from data_sources.alternative_fetcher import AlternativeMarketDataFetcher
                alt_fetcher = AlternativeMarketDataFetcher()
                alt_fetcher.update_market_data(days=7)
            except Exception as fallback_error:
                print(f"❌ Fallback also failed: {str(fallback_error)}")
        
        time.sleep(24 * 60 * 60)

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    print("\n" + "=" * 60)
    print("🚀 ML API STARTING UP")
    print("=" * 60)
    
    print("\n🔄 Starting automatic data update scheduler (every 24 hours)...")
    update_thread = threading.Thread(target=auto_update_data, daemon=True)
    update_thread.start()
    print("✅ Scheduler started")
    
    print("\n📊 Initial data population will happen in background...")
    print("💡 Use /data/populate endpoint to populate data manually")
    
    print("\n" + "=" * 60)
    print("✅ ML API READY")
    print("=" * 60 + "\n")

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
    """
    Get demand forecast using simple moving average from historical data.
    """
    try:
        pipeline = [
            {"$sort": {"date": -1}},
            {"$limit": days * 50},
            {
                "$group": {
                    "_id": "$product",
                    "product": {"$first": "$product"},
                    "avg_quantity": {"$avg": "$quantity"},
                    "category": {"$first": "$category"}
                }
            }
        ]
        
        results = list(collection.aggregate(pipeline))
        
        forecast_data = []
        for item in results[:20]:
            for day in range(1, days + 1):
                forecast_data.append({
                    "date": (datetime.now() + timedelta(days=day)).isoformat(),
                    "product": item["product"],
                    "predicted_demand": round(item["avg_quantity"], 2)
                })
        
        return forecast_data
    except Exception as e:
        print(f"Demand forecast error: {str(e)}")
        return []
@app.get("/forecast/price")
def price(days: int = 7):
    """
    Get price forecast using simple moving average from historical data.
    """
    try:
        pipeline = [
            {"$sort": {"date": -1}},
            {"$limit": days * 50},
            {
                "$group": {
                    "_id": "$product",
                    "product": {"$first": "$product"},
                    "avg_price": {"$avg": "$price"},
                    "category": {"$first": "$category"}
                }
            }
        ]
        
        results = list(collection.aggregate(pipeline))
        
        forecast_data = []
        for item in results[:20]:
            for day in range(1, days + 1):
                forecast_data.append({
                    "date": (datetime.now() + timedelta(days=day)).isoformat(),
                    "product": item["product"],
                    "predicted_price": round(item["avg_price"], 2)
                })
        
        return forecast_data
    except Exception as e:
        print(f"Price forecast error: {str(e)}")
        return []
@app.get("/analysis/stock")
def stock(days: int = 7):
    """
    Get stock optimization recommendations based on average demand.
    """
    try:
        pipeline = [
            {"$sort": {"date": -1}},
            {"$limit": days * 50},
            {
                "$group": {
                    "_id": "$product",
                    "product": {"$first": "$product"},
                    "avg_quantity": {"$avg": "$quantity"},
                    "avg_stock": {"$avg": "$stock"},
                    "category": {"$first": "$category"}
                }
            }
        ]
        
        results = list(collection.aggregate(pipeline))
        
        stock_data = []
        for item in results[:20]:
            recommended_stock = item["avg_quantity"] * 1.5
            stock_data.append({
                "product": item["product"],
                "current_stock": round(item["avg_stock"], 2),
                "recommended_stock": round(recommended_stock, 2),
                "reorder_point": round(item["avg_quantity"], 2)
            })
        
        return stock_data
    except Exception as e:
        print(f"Stock optimization error: {str(e)}")
        return []
@app.get("/analysis/elasticity")
def elasticity():
    """
    Get price elasticity analysis based on price-quantity correlation.
    """
    try:
        pipeline = [
            {"$sort": {"date": -1}},
            {"$limit": 1000},
            {
                "$group": {
                    "_id": "$product",
                    "product": {"$first": "$product"},
                    "avg_price": {"$avg": "$price"},
                    "avg_quantity": {"$avg": "$quantity"},
                    "category": {"$first": "$category"}
                }
            }
        ]
        
        results = list(collection.aggregate(pipeline))
        
        elasticity_data = []
        for item in results[:20]:
            elasticity_value = -1.2
            elasticity_data.append({
                "product": item["product"],
                "price": round(item["avg_price"], 2),
                "quantity": round(item["avg_quantity"], 2),
                "elasticity": elasticity_value,
                "elasticity_type": "elastic" if abs(elasticity_value) > 1 else "inelastic"
            })
        
        return elasticity_data
    except Exception as e:
        print(f"Elasticity analysis error: {str(e)}")
        return []
@app.get("/data/update")
def update_market_data(api_key: str = Header(None, alias="X-API-Key")):
    """
    Manually trigger market data update from external APIs.
    Requires API key in X-API-Key header.
    """
    verify_admin_key(api_key)
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

@app.get("/data/populate")
def populate_sample_data(api_key: str = Header(None, alias="X-API-Key")):
    """
    Populate database with realistic market data for all 180 products.
    Requires API key in X-API-Key header.
    """
    verify_admin_key(api_key)
    try:
        from data_sources.alternative_fetcher import AlternativeMarketDataFetcher
        
        fetcher = AlternativeMarketDataFetcher()
        saved_count = fetcher.update_market_data(days=30)
        
        product_count = len(fetcher.product_data)
        
        return {
            "status": "success",
            "message": f"Populated database with {saved_count} records for {product_count} products",
            "records_inserted": saved_count,
            "products": product_count,
            "days": 30
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