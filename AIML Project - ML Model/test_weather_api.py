"""
Test OpenWeather API key
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENWEATHER_API_KEY", "")

print("=" * 70)
print("🌤️  TESTING OPENWEATHER API KEY")
print("=" * 70)
print(f"API Key: {api_key[:10]}...{api_key[-5:]}")
print()

# Test with a simple request
url = "https://api.openweathermap.org/data/2.5/weather"
params = {
    "q": "London,UK",
    "appid": api_key,
    "units": "metric"
}

try:
    response = requests.get(url, params=params, timeout=10)
    
    print(f"Status Code: {response.status_code}")
    print()
    
    if response.status_code == 200:
        data = response.json()
        print("✅ API KEY IS VALID!")
        print()
        print(f"Location: {data['name']}, {data['sys']['country']}")
        print(f"Temperature: {data['main']['temp']}°C")
        print(f"Weather: {data['weather'][0]['main']}")
        print(f"Humidity: {data['main']['humidity']}%")
        
    elif response.status_code == 401:
        print("❌ 401 UNAUTHORIZED")
        print()
        print("Possible reasons:")
        print("1. API key is invalid or incorrect")
        print("2. API key needs activation (can take 1-2 hours)")
        print("3. API key was deleted or expired")
        print()
        print("Solutions:")
        print("1. Check if you copied the key correctly")
        print("2. Wait 1-2 hours if you just created the key")
        print("3. Generate a new API key at: https://home.openweathermap.org/api_keys")
        print()
        print(f"Response: {response.text}")
        
    else:
        print(f"⚠️  Unexpected status code: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")

print()
print("=" * 70)
print("💡 FALLBACK STRATEGY")
print("=" * 70)
print("Don't worry! Your application will still work.")
print("The system uses seasonal weather averages as fallback.")
print("This provides realistic weather data based on:")
print("  - Current month")
print("  - Historical seasonal patterns")
print("  - Regional climate data")
print("=" * 70)
