import pandas as pd
import numpy as np
from forecasting.forecast_generator import generate_forecast
from preprocessing.load_data import load_sales_data
def optimize_stock(days=7, service_level=1.65):
    forecast_df = generate_forecast(days)
    df = load_sales_data()
    results = []
    for product in forecast_df["product"].unique():
        product_history = df[df["product"] == product]
        demand_std = product_history["demand"].std()
        safety_stock = service_level * demand_std
        future_demand = forecast_df[
            forecast_df["product"] == product
        ]["predicted_demand"].sum()
        recommended_stock = future_demand + safety_stock
        current_stock = product_history.iloc[-1]["stock"]
        stock_gap = recommended_stock - current_stock
        status = "Optimal"
        if stock_gap > 20:
            status = "Reorder Required"
        elif stock_gap < -20:
            status = "Overstock Risk"
        results.append({
            "product": product,
            "future_7day_demand": future_demand,
            "current_stock": current_stock,
            "recommended_stock": recommended_stock,
            "stock_gap": stock_gap,
            "status": status
        })
    result_df = pd.DataFrame(results)
    print("\nStock Optimization Report:")
    print(result_df)
    return result_df
if __name__ == "__main__":
    optimize_stock(7)