"""
Test script to verify Agmarknet API key and endpoint.
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def test_agmarknet_api():
    """Test Agmarknet API with different configurations"""
    
    api_key = os.getenv("AGMARKNET_API_KEY", "")
    
    print("=" * 70)
    print("🔍 TESTING AGMARKNET API")
    print("=" * 70)
    print(f"API Key: {api_key[:15]}...{api_key[-5:]}")
    print()
    
    test_commodities = ["Tomato", "Potato", "Onion", "Apple", "Banana"]
    
    for commodity in test_commodities:
        print(f"\n📦 Testing: {commodity}")
        print("-" * 70)
        
        url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
        
        params = {
            "api-key": api_key,
            "format": "json",
            "filters[commodity]": commodity,
            "limit": 5
        }
        
        headers = {
            "User-Agent": "CropIntelHub/1.0",
            "Accept": "application/json"
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=15)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if "records" in data:
                    print(f"✅ Success! Found {len(data['records'])} records")
                    
                    if len(data['records']) > 0:
                        print("\nSample record:")
                        record = data['records'][0]
                        for key, value in list(record.items())[:5]:
                            print(f"  {key}: {value}")
                else:
                    print(f"⚠️  Response structure: {list(data.keys())}")
                    
            elif response.status_code == 403:
                print("❌ 403 Forbidden - API key may be invalid or expired")
                print(f"Response: {response.text[:200]}")
                
            elif response.status_code == 401:
                print("❌ 401 Unauthorized - API key authentication failed")
                print(f"Response: {response.text[:200]}")
                
            else:
                print(f"⚠️  Unexpected status code: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                
        except requests.exceptions.Timeout:
            print("❌ Request timed out")
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {str(e)}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 70)
    print("🔍 TESTING ALTERNATIVE ENDPOINT")
    print("=" * 70)
    
    alt_url = "https://api.data.gov.in/catalog/9ef84268-d588-465a-a308-a864a43d0070"
    
    try:
        response = requests.get(alt_url, params={"api-key": api_key, "format": "json"}, 
                              headers=headers, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Alternative endpoint accessible")
        else:
            print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 70)
    print("💡 RECOMMENDATIONS")
    print("=" * 70)
    print("1. If getting 403 errors, verify API key at: https://data.gov.in/")
    print("2. Check if API key needs to be activated or has usage limits")
    print("3. Try regenerating the API key from data.gov.in dashboard")
    print("4. Ensure API key has access to the specific dataset")
    print("=" * 70)

if __name__ == "__main__":
    test_agmarknet_api()
