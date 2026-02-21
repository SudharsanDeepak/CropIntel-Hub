import pandas as pd
import numpy as np
from preprocessing.load_data import load_sales_data
def calculate_elasticity():
    df = load_sales_data()
    df["date"] = pd.to_datetime(df["date"])
    results = []
    for product in df["product"].unique():
        product_df = df[df["product"] == product].copy()
        product_df = product_df.sort_values("date")
        product_df["demand_pct_change"] = product_df["demand"].pct_change()
        product_df["price_pct_change"] = product_df["price"].pct_change()
        product_df = product_df.dropna()
        elasticity_values = product_df["demand_pct_change"] / product_df["price_pct_change"]
        elasticity_values = elasticity_values.replace([np.inf, -np.inf], np.nan)
        elasticity = np.nanmean(elasticity_values)
        if np.isnan(elasticity) or np.isinf(elasticity):
            elasticity = 0.0
        results.append({
            "product": product,
            "price_elasticity": float(elasticity)
        })
    elasticity_df = pd.DataFrame(results)
    print("\nPrice Elasticity Analysis:")
    print(elasticity_df)
    return elasticity_df
if __name__ == "__main__":
    calculate_elasticity()