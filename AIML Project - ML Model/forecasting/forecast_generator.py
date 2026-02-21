import pandas as pd
import joblib
from datetime import timedelta
from preprocessing.feature_engineering import create_features
from preprocessing.load_data import load_sales_data
def generate_forecast(days=7):
    model = joblib.load("models/demand_model.pkl")
    feature_columns = joblib.load("models/demand_feature_columns.pkl")
    df = load_sales_data()
    df["date"] = pd.to_datetime(df["date"])
    forecast_results = []
    last_date = df["date"].max()
    for i in range(1, days + 1):
        future_date = last_date + timedelta(days=i)
        for product in df["product"].unique():
            product_df = df[df["product"] == product].copy()
            product_df = product_df.sort_values("date")
            last_row = product_df.iloc[-1].copy()
            new_row = last_row.copy()
            new_row["date"] = future_date
            temp_df = pd.concat([product_df, pd.DataFrame([new_row])])
            temp_df = create_features(temp_df)
            temp_df = temp_df.dropna()
            temp_df = pd.get_dummies(temp_df, columns=["product", "season"], drop_first=True)
            X_future = temp_df.iloc[-1].drop(["date", "demand"])
            for col in feature_columns:
                if col not in X_future:
                    X_future[col] = 0
            X_future = X_future[feature_columns]
            prediction = model.predict(pd.DataFrame([X_future], columns=feature_columns))[0]
            new_row["demand"] = prediction
            df = pd.concat([df, pd.DataFrame([new_row])])
            forecast_results.append({
                "date": future_date,
                "product": product,
                "predicted_demand": prediction
            })
    forecast_df = pd.DataFrame(forecast_results)
    print("\nIterative Forecast for next", days, "days:")
    print(forecast_df)
    return forecast_df
if __name__ == "__main__":
    generate_forecast(7)