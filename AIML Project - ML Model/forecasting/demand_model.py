import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from preprocessing.feature_engineering import create_features
from preprocessing.load_data import load_sales_data
def train_model():
    df = load_sales_data()
    df = create_features(df)
    df = df.dropna()
    df = pd.get_dummies(df, columns=["product", "season"], drop_first=True)
    df = df.sort_values("date")
    split_index = int(len(df) * 0.8)
    train = df.iloc[:split_index]
    test = df.iloc[split_index:]
    X_train = train.drop(columns=["date", "demand"])
    y_train = train["demand"]
    X_test = test.drop(columns=["date", "demand"])
    y_test = test["demand"]
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    print("Model trained successfully.")
    print("Mean Absolute Error:", round(mae, 2))
    joblib.dump(model, "models/demand_model.pkl")
    joblib.dump(X_train.columns.tolist(), "models/demand_feature_columns.pkl")
    print("Model and feature columns saved.")
    return model
if __name__ == "__main__":
    train_model()