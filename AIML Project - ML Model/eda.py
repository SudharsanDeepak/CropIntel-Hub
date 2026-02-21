import pandas as pd
from preprocessing.feature_engineering import create_features
from preprocessing.load_data import load_sales_data
df = load_sales_data()
df = create_features(df)
print(df.head(10))