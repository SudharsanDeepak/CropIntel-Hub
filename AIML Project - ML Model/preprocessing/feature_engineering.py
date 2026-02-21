import pandas as pd
def create_features(df):
    df["date"] = pd.to_datetime(df["date"])
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["day_of_week"] = df["date"].dt.dayofweek
    df["week_of_year"] = df["date"].dt.isocalendar().week
    def get_season(month):
        if month in [3,4,5]:
            return "Summer"
        elif month in [6,7,8,9]:
            return "Monsoon"
        else:
            return "Winter"
    df["season"] = df["month"].apply(get_season)
    df = df.sort_values(by=["product", "date"])
    df["lag_1"] = df.groupby("product")["demand"].shift(1)
    df["lag_7"] = df.groupby("product")["demand"].shift(7)
    df["rolling_mean_7"] = df.groupby("product")["demand"].transform(lambda x: x.rolling(7).mean())
    return df