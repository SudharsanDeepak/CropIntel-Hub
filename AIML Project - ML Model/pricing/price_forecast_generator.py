import pandas as pd
import joblib
from datetime import timedelta
from preprocessing.feature_engineering import create_features
from forecasting.forecast_generator import generate_forecast
from preprocessing.load_data import load_sales_data
def generate_price_forecast(days=7):
    price_model = joblib.load("models/price_model.pkl")
    feature_columns = joblib.load("models/price_feature_columns.pkl")
    demand_forecast = generate_forecast(days)
    df = load_sales_data()
    df["date"] = pd.to_datetime(df["date"])
    results = []
    for _, row in demand_forecast.iterrows():
        product = row["product"]
        future_date = row["date"]
        predicted_demand = row["predicted_demand"]
        product_df = df[df["product"] == product].copy()
        product_df = product_df.sort_values("date")
        last_row = product_df.iloc[-1].copy()
        new_row = last_row.copy()
        new_row["date"] = future_date
        new_row["demand"] = predicted_demand
        temp_df = pd.concat([product_df, pd.DataFrame([new_row])])
        temp_df = create_features(temp_df)
        temp_df = temp_df.dropna()
        temp_df = pd.get_dummies(temp_df, columns=["product", "season"], drop_first=True)
        X_future = temp_df.iloc[-1].drop(["date", "price"])
        for col in feature_columns:
            if col not in X_future:
                X_future[col] = 0
        X_future = X_future[feature_columns]
        predicted_price = price_model.predict(
            pd.DataFrame([X_future], columns=feature_columns)
        )[0]
        results.append({
            "date": future_date,
            "product": product,
            "predicted_demand": predicted_demand,
            "predicted_price": predicted_price
        })
    result_df = pd.DataFrame(results)
    print("\nFuture Price Forecast:")
    print(result_df)
    return result_df
if __name__ == "__main__":
    generate_price_forecast(7)