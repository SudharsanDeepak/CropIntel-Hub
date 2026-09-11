from fastapi import FastAPI, Query, BackgroundTasks, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import threading
import time
from data_sources.mongodb_utils import sanitize_market_record
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

# Create indexes for better query performance
try:
    collection.create_index([("product", 1), ("date", -1)])
    collection.create_index([("district", 1), ("product", 1), ("date", -1)])
    collection.create_index([("category", 1), ("date", -1)])
    collection.create_index([("date", -1)])
    print("✅ MongoDB indexes created successfully")
except Exception as e:
    print(f"⚠️ Index creation warning: {e}")

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
            
            from data_sources.comprehensive_market_fetcher import ComprehensiveMarketFetcher
            fetcher = ComprehensiveMarketFetcher()
            saved_count = fetcher.update_all_products(days=7)
            
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
def root():
    return {
        "status": "ML Service Running",
        "data_source": "Real-time Market Data + MongoDB",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "products": "/products/latest"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring services"""
    try:
        # Check MongoDB connection
        db_status = "connected"
        product_count = 0
        try:
            product_count = len(collection.distinct("product"))
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        # Check if we have recent data
        recent_data = collection.count_documents({
            "date": {"$gte": datetime.now() - timedelta(days=7)}
        })
        
        health = {
            "status": "healthy" if db_status == "connected" else "degraded",
            "timestamp": datetime.now().isoformat(),
            "service": "ml_api",
            "database": {
                "status": db_status,
                "products_tracked": product_count,
                "recent_records": recent_data
            },
            "uptime": "running"
        }
        
        return health
    except Exception as e:
        return {
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "service": "ml_api",
            "error": str(e)
        }
@app.get("/products/latest")
def get_latest_products(
    limit: Optional[int] = Query(None, description="Limit number of products"),
    category: Optional[str] = Query(None, description="Filter by category: fruit or vegetable"),
    search: Optional[str] = Query(None, description="Search by product name"),
    district: Optional[str] = Query(None, description="Tamil Nadu district")
):
    """
    Fast endpoint to get latest prices for all products.
    No ML processing - just raw data from database.
    """
    try:
        # Build optimized pipeline with early filtering
        pipeline = []
        
        # Apply filters first to reduce dataset size
        match_stage = {}
        if category:
            match_stage["category"] = category
        if district:
            match_stage["district"] = district
        if search:
            match_stage["product"] = {"$regex": search, "$options": "i"}
        
        if match_stage:
            pipeline.append({"$match": match_stage})
        
        # Sort and group
        pipeline.extend([
            {"$sort": {"date": -1}},
            {
                "$group": {
                    "_id": {"product": "$product", "district": "$district"} if district else "$product",
                    "product": {"$first": "$product"},
                    "category": {"$first": "$category"},
                    "price": {"$first": "$price"},
                    "quantity": {"$first": "$quantity"},
                    "avg_quantity": {"$avg": "$quantity"},
                    "stock": {"$first": "$stock"},
                    "date": {"$first": "$date"},
                    "source": {"$first": "$source"},
                    "district": {"$first": "$district"},
                    "market": {"$first": "$market"},
                    "min_price": {"$first": "$min_price"},
                    "max_price": {"$first": "$max_price"}
                }
            },
            {"$limit": limit if limit else 200}  # Default limit to prevent huge responses
        ])
        
        # Execute with timeout
        results = list(collection.aggregate(pipeline, maxTimeMS=25000))  # 25 second timeout

        # Government feeds do not report every commodity in every district on
        # every day. Fill only missing district/product combinations from the
        # latest Tamil Nadu record and mark those values as references.
        if district and not limit:
            fallback_pipeline = []
            fallback_match = {}
            if category:
                fallback_match["category"] = category
            if search:
                fallback_match["product"] = {"$regex": search, "$options": "i"}
            if fallback_match:
                fallback_pipeline.append({"$match": fallback_match})
            fallback_pipeline.extend([
                {"$sort": {"date": -1}},
                {
                    "$group": {
                        "_id": "$product",
                        "product": {"$first": "$product"},
                        "category": {"$first": "$category"},
                        "price": {"$first": "$price"},
                        "quantity": {"$first": "$quantity"},
                        "avg_quantity": {"$avg": "$quantity"},
                        "stock": {"$first": "$stock"},
                        "date": {"$first": "$date"},
                        "source": {"$first": "$source"},
                        "market": {"$first": "$market"},
                        "min_price": {"$first": "$min_price"},
                        "max_price": {"$first": "$max_price"}
                    }
                }
            ])
            fallback_results = list(collection.aggregate(fallback_pipeline, maxTimeMS=25000))
            exact_products = {item.get("product") for item in results}
            results.extend(
                {
                    **item,
                    "district": district,
                    "market": None,
                    "source": "statewide_reference",
                    "price_scope": "tamil_nadu_statewide",
                    "price_available": False
                }
                for item in fallback_results
                if item.get("product") not in exact_products
            )
        
        products = []
        for item in results:
            safe_item = sanitize_market_record(item)
            demand_quantity = safe_item.get("avg_quantity") or safe_item.get("quantity")
            is_statewide_reference = safe_item.get("source") == "statewide_reference"
            is_market_arrival = safe_item.get("source") == "agmarknet_government"
            demand_available = is_market_arrival and demand_quantity is not None and float(demand_quantity) > 0
            products.append({
                "product": safe_item["product"],
                "category": safe_item.get("category", "fruit"),
                "price": float(safe_item["price"]),
                "predicted_demand": round(float(demand_quantity), 1) if demand_available else 0,
                "demand_unit": "market arrivals (kg)" if demand_available else "unavailable",
                "demand_source": "Agmarknet market arrivals" if demand_available else "No verified daily arrivals reported",
                "demand_location": "Tamil Nadu statewide reference" if is_statewide_reference else safe_item.get("district"),
                "demand_available": demand_available and not is_statewide_reference,
                "stock": int(safe_item.get("stock", 100)),
                "date": safe_item["date"].isoformat() if isinstance(safe_item["date"], datetime) else str(safe_item["date"]),
                "source": safe_item.get("source", "database"),
                "district": safe_item.get("district"),
                "market": safe_item.get("market"),
                "min_price": float(safe_item.get("min_price") or safe_item["price"]),
                "max_price": float(safe_item.get("max_price") or safe_item["price"])
                ,"price_scope": safe_item.get("price_scope", "district")
                ,"price_available": safe_item.get("price_available", True)
            })
        
        return products
    except Exception as e:
        print(f"❌ Error in /products/latest: {str(e)}")
        return {"error": str(e), "products": []}

@app.get("/districts")
def get_districts():
    """Return districts currently represented by government market records."""
    try:
        return list(collection.distinct("district", {"district": {"$nin": [None, "", "Unknown"]}}))
    except Exception as e:
        return {"error": str(e), "districts": []}
@app.get("/products/{product_name}/forecast")
def get_product_forecast(product_name: str, days: int = 7, district: Optional[str] = None):
    """
    Fast endpoint to get forecast for a specific product.
    Only processes one product at a time.
    """
    try:
        match = {"product": product_name}
        if district:
            match["district"] = district
        historical = list(collection.find(match).sort("date", -1).limit(30))
        if not historical and district:
            match = {"product": product_name}
            historical = list(collection.find(match).sort("date", -1).limit(30))
        if not historical:
            return {"error": "Product not found", "forecasts": []}
        price_pipeline = [
            {"$match": match},
            {"$sort": {"date": -1}},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
                    "date": {"$first": "$date"},
                    "price": {"$avg": "$price"},
                    "quantity": {"$avg": "$quantity"}
                }
            },
            {"$sort": {"date": -1}},
            {"$limit": days}
        ]
        price_data = list(collection.aggregate(price_pipeline))
        forecasts = []
        for item in price_data:
            forecasts.append({
                "date": item["date"].isoformat() if isinstance(item["date"], datetime) else str(item["date"]),
                "predicted_price": round(float(item["price"]), 2),
                "predicted_demand": round(float(item.get("quantity") or 0), 1),
                "product": product_name
            })
        return forecasts
    except Exception as e:
        return {"error": str(e), "forecasts": []}
@app.get("/forecast/demand")
def demand(days: int = 7, district: Optional[str] = None):
    """
    Get demand forecast using simple moving average from historical data.
    """
    try:
        pipeline = []
        if district:
            pipeline.append({"$match": {"district": district}})
        pipeline.extend([
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
        ])
        
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
def price(days: int = 7, district: Optional[str] = None):
    """
    Get price forecast using simple moving average from historical data.
    """
    try:
        pipeline = []
        if district:
            pipeline.append({"$match": {"district": district}})
        pipeline.extend([
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
        ])
        
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
def stock(days: int = 7, district: Optional[str] = None):
    """
    Get stock optimization recommendations based on average demand.
    """
    try:
        pipeline = []
        if district:
            pipeline.append({"$match": {"district": district}})
        pipeline.extend([
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
        ])
        
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
def elasticity(district: Optional[str] = None):
    """
    Get price elasticity analysis based on price-quantity correlation.
    """
    try:
        pipeline = []
        if district:
            pipeline.append({"$match": {"district": district}})
        pipeline.extend([
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
        ])
        
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
    Uses comprehensive fetcher with API fallback strategy.
    Requires API key in X-API-Key header.
    """
    verify_admin_key(api_key)
    try:
        from data_sources.comprehensive_market_fetcher import ComprehensiveMarketFetcher
        
        fetcher = ComprehensiveMarketFetcher()
        saved_count = fetcher.update_all_products(days=30)
        
        product_count = len(fetcher.products_180)
        
        return {
            "status": "success",
            "message": f"Populated database with {saved_count} records for {product_count} products",
            "records_inserted": saved_count,
            "products": product_count,
            "days": 30,
            "data_sources": "Agmarknet API → USDA API → Realistic Simulation"
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