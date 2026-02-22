"""
Weather data fetcher for agricultural price predictions.
Uses OpenWeatherMap API to get real-time weather data.
"""
import requests
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class WeatherFetcher:
    """
    Fetches real-time weather data for agricultural regions.
    Weather data is crucial for price predictions.
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY", "")
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
        
        self.indian_cities = [
            "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
            "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"
        ]
    
    def fetch_weather_for_city(self, city):
        """
        Fetch current weather data for a specific city.
        Returns temperature (°C) and rainfall (mm).
        """
        if not self.api_key or self.api_key == "your_openweather_api_key":
            return None
        
        try:
            params = {
                "q": f"{city},IN",
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                temperature = data["main"]["temp"]
                
                rainfall = 0
                if "rain" in data:
                    rainfall = data["rain"].get("1h", 0)
                
                humidity = data["main"]["humidity"]
                
                return {
                    "city": city,
                    "temperature": round(temperature, 2),
                    "rainfall": round(rainfall, 2),
                    "humidity": humidity,
                    "weather": data["weather"][0]["main"],
                    "description": data["weather"][0]["description"],
                    "timestamp": datetime.now()
                }
            else:
                print(f"⚠️  Weather API returned status {response.status_code} for {city}")
                return None
                
        except Exception as e:
            print(f"❌ Weather fetch failed for {city}: {str(e)}")
            return None
    
    def fetch_average_weather(self):
        """
        Fetch weather data from multiple Indian cities and return average.
        This provides a national average for agricultural predictions.
        """
        if not self.api_key or self.api_key == "your_openweather_api_key":
            print("⚠️  OpenWeather API key not configured")
            return self._get_fallback_weather()
        
        weather_data = []
        
        for city in self.indian_cities[:5]:
            data = self.fetch_weather_for_city(city)
            if data:
                weather_data.append(data)
        
        if not weather_data:
            print("⚠️  No weather data fetched, using fallback")
            return self._get_fallback_weather()
        
        avg_temp = sum(d["temperature"] for d in weather_data) / len(weather_data)
        avg_rainfall = sum(d["rainfall"] for d in weather_data) / len(weather_data)
        avg_humidity = sum(d["humidity"] for d in weather_data) / len(weather_data)
        
        return {
            "temperature": round(avg_temp, 2),
            "rainfall": round(avg_rainfall, 2),
            "humidity": round(avg_humidity, 2),
            "cities_sampled": len(weather_data),
            "timestamp": datetime.now()
        }
    
    def _get_fallback_weather(self):
        """
        Fallback weather data based on seasonal averages for India.
        Used when API is not available.
        """
        import random
        from datetime import datetime
        
        month = datetime.now().month
        
        if month in [12, 1, 2]:
            temp_range = (15, 25)
            rain_range = (0, 5)
        elif month in [3, 4, 5]:
            temp_range = (25, 35)
            rain_range = (0, 10)
        elif month in [6, 7, 8, 9]:
            temp_range = (25, 32)
            rain_range = (50, 200)
        else:
            temp_range = (20, 30)
            rain_range = (10, 50)
        
        return {
            "temperature": round(random.uniform(*temp_range), 2),
            "rainfall": round(random.uniform(*rain_range), 2),
            "humidity": random.randint(60, 90),
            "source": "seasonal_average",
            "timestamp": datetime.now()
        }
    
    def get_weather_for_product(self, product_name=None):
        """
        Get weather data suitable for a specific product.
        Returns current weather conditions.
        """
        return self.fetch_average_weather()

def main():
    """Test the weather fetcher"""
    fetcher = WeatherFetcher()
    
    print("\n" + "=" * 60)
    print("🌤️  WEATHER DATA FETCHER TEST")
    print("=" * 60)
    
    weather = fetcher.fetch_average_weather()
    
    print(f"\n📊 Average Weather Data:")
    print(f"   Temperature: {weather['temperature']}°C")
    print(f"   Rainfall: {weather['rainfall']} mm")
    print(f"   Humidity: {weather.get('humidity', 'N/A')}%")
    print(f"   Source: {weather.get('source', 'OpenWeatherMap API')}")
    print(f"   Cities: {weather.get('cities_sampled', 'N/A')}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
