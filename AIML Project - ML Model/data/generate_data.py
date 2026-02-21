import pandas as pd
import numpy as np
np.random.seed(42)
dates = pd.date_range(start="2022-01-01", end="2023-12-31")
products = ["Tomato", "Potato", "Onion", "Apple", "Banana"]
data = []
for date in dates:
    for product in products:
        if date.month in [3,4,5]:
            season_factor = 1.2
        elif date.month in [6,7,8,9]:
            season_factor = 0.9
        else:
            season_factor = 1.1
        base_demand = np.random.randint(50, 200)
        demand = base_demand * season_factor
        price = np.random.uniform(10, 50)
        stock = np.random.randint(100, 300)
        temperature = np.random.uniform(20, 40)
        rainfall = np.random.uniform(0, 20)
        data.append([
            date, product, demand, price, stock, temperature, rainfall
        ])
df = pd.DataFrame(data, columns=[
    "date", "product", "demand", "price",
    "stock", "temperature", "rainfall"
])
df.to_csv("sales_data.csv", index=False)
print("Dataset generated successfully!")