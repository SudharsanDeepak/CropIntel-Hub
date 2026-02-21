# Blinkit Data Integration Guide

## ⚠️ Important Legal Notice

**Before proceeding, please note:**

1. **Terms of Service**: Web scraping Blinkit may violate their Terms of Service
2. **Legal Implications**: Unauthorized data scraping can have legal consequences
3. **Ethical Considerations**: Always respect website policies and rate limits
4. **Alternative Approaches**: Consider official APIs or partnerships

**This guide is for educational/research purposes only.**

---

## 📋 Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Method 1: HTML Scraping](#method-1-html-scraping)
3. [Method 2: API Endpoints](#method-2-api-endpoints)
4. [Method 3: Browser Automation](#method-3-browser-automation)
5. [Integration with Existing System](#integration)
6. [Troubleshooting](#troubleshooting)

---

## 🛠️ Setup Instructions

### Prerequisites

```bash
# Install required packages
pip install requests beautifulsoup4 selenium pandas pymongo python-dotenv
```

### Environment Variables

Add to your `.env` file:

```env
# MongoDB
MONGO_URI=mongodb+srv://SudharsanDeepak:sudharsan@cluster0.g6tkwcc.mongodb.net/

# Blinkit Settings (optional)
BLINKIT_REQUEST_DELAY=3  # seconds between requests
BLINKIT_MAX_RETRIES=3
```

---

## 📝 Method 1: HTML Scraping

### Step 1: Inspect Blinkit Website

1. Open https://blinkit.com in your browser
2. Navigate to "Fruits & Vegetables" section
3. Right-click and select "Inspect" (or press F12)
4. Look at the HTML structure

### Step 2: Find Product Elements

Look for patterns like:
```html
<div class="Product__ProductCard">
  <div class="Product__ProductName">Tomato</div>
  <div class="Product__ProductPrice">₹25</div>
  <div class="Product__ProductUnit">500 g</div>
</div>
```

### Step 3: Update Selectors

Edit `blinkit_fetcher.py` and update the CSS selectors:

```python
# Update these based on actual HTML structure
name_elem = card_element.find('div', class_='Product__ProductName')
price_elem = card_element.find('div', class_='Product__ProductPrice')
```

### Step 4: Run the Scraper

```bash
cd "AIML Project - ML Model/data_sources"
python blinkit_fetcher.py
```

---

## 🔌 Method 2: API Endpoints (Recommended)

### Step 1: Find API Endpoints

1. Open Blinkit website
2. Open DevTools (F12) -> Network tab
3. Filter by "XHR" or "Fetch"
4. Navigate to Fruits & Vegetables
5. Look for API calls like:
   ```
   https://blinkit.com/v2/products?category_id=1487
   https://blinkit.com/api/v1/search?q=tomato
   ```

### Step 2: Analyze API Response

Click on the API call and check:
- **Request Headers**: Any authentication tokens?
- **Request Payload**: What parameters are sent?
- **Response**: JSON structure

Example response:
```json
{
  "products": [
    {
      "id": "12345",
      "name": "Tomato - Hybrid",
      "price": 25,
      "mrp": 30,
      "unit": "500 g",
      "in_stock": true,
      "image_url": "https://..."
    }
  ]
}
```

### Step 3: Update API Fetcher

Edit `blinkit_api_fetcher.py`:

```python
# Update with actual API endpoint
self.api_base = "https://blinkit.com/v2"  # or actual base URL

# Update headers if authentication is needed
self.headers = {
    'Authorization': 'Bearer YOUR_TOKEN',  # if required
    'X-API-Key': 'YOUR_KEY',  # if required
}
```

### Step 4: Run API Fetcher

```bash
python blinkit_api_fetcher.py
```

---

## 🤖 Method 3: Browser Automation (Most Reliable)

### Install Selenium

```bash
pip install selenium webdriver-manager
```

### Create Selenium Scraper

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# Navigate to Blinkit
driver.get("https://blinkit.com/cn/fruits-vegetables/cid/1487")
time.sleep(5)  # Wait for page load

# Find products
products = driver.find_elements(By.CLASS_NAME, "Product__ProductCard")

for product in products:
    name = product.find_element(By.CLASS_NAME, "Product__ProductName").text
    price = product.find_element(By.CLASS_NAME, "Product__ProductPrice").text
    print(f"{name}: {price}")

driver.quit()
```

---

## 🔗 Integration with Existing System

### Update `api_fetcher.py`

Add Blinkit to the existing fetcher:

```python
from data_sources.blinkit_api_fetcher import BlinkitAPIFetcher

class MarketDataFetcher:
    def __init__(self):
        # ... existing code ...
        self.blinkit_fetcher = BlinkitAPIFetcher()
    
    def fetch_all_products(self, products=None):
        # ... existing code ...
        
        # Add Blinkit data
        print("\n📦 Fetching from Blinkit...")
        blinkit_records = self.blinkit_fetcher.fetch_all_fruits_vegetables()
        if blinkit_records:
            all_records.extend(blinkit_records)
            print(f"   ✅ Blinkit: {len(blinkit_records)} records")
        
        return all_records
```

### Update Scheduler

Edit `scheduler.py` to include Blinkit:

```python
def scheduled_update():
    fetcher = MarketDataFetcher()
    fetcher.update_market_data()  # Now includes Blinkit
```

---

## 🔍 Troubleshooting

### Issue 1: No Products Found

**Possible causes:**
- Website structure changed
- Incorrect CSS selectors
- JavaScript-rendered content

**Solutions:**
1. Inspect current HTML structure
2. Update CSS selectors
3. Use Selenium for JavaScript-rendered content

### Issue 2: 403 Forbidden / 429 Too Many Requests

**Possible causes:**
- Rate limiting
- IP blocking
- Missing headers

**Solutions:**
1. Increase delay between requests
2. Add proper User-Agent header
3. Use rotating proxies (advanced)
4. Respect robots.txt

### Issue 3: Empty Prices

**Possible causes:**
- Prices are loaded via JavaScript
- Incorrect selector

**Solutions:**
1. Use Selenium to wait for JavaScript
2. Check Network tab for API calls
3. Use API method instead of HTML scraping

---

## 📊 Data Quality Checks

After fetching data, validate:

```python
def validate_blinkit_data(products):
    """Validate fetched data quality"""
    
    issues = []
    
    for product in products:
        # Check required fields
        if not product.get('product'):
            issues.append(f"Missing product name: {product}")
        
        # Check price validity
        if product.get('price', 0) <= 0:
            issues.append(f"Invalid price for {product.get('product')}")
        
        # Check for duplicates
        # ... add duplicate check logic
    
    return issues
```

---

## 🎯 Best Practices

1. **Rate Limiting**: Wait 2-3 seconds between requests
2. **Error Handling**: Implement retry logic with exponential backoff
3. **Logging**: Log all requests and errors
4. **Data Validation**: Validate data before saving to database
5. **Monitoring**: Set up alerts for fetch failures
6. **Caching**: Cache results to reduce requests
7. **Respect robots.txt**: Check and follow robots.txt rules

---

## 📈 Performance Optimization

### Parallel Fetching

```python
from concurrent.futures import ThreadPoolExecutor

def fetch_category_parallel(categories):
    with ThreadPoolExecutor(max_workers=3) as executor:
        results = executor.map(fetch_category_page, categories)
    return list(results)
```

### Caching

```python
import redis
from datetime import timedelta

cache = redis.Redis(host='localhost', port=6379)

def get_cached_products(category_id):
    key = f"blinkit:category:{category_id}"
    cached = cache.get(key)
    
    if cached:
        return json.loads(cached)
    
    # Fetch fresh data
    products = fetch_category_products(category_id)
    
    # Cache for 1 hour
    cache.setex(key, timedelta(hours=1), json.dumps(products))
    
    return products
```

---

## 🚀 Next Steps

1. **Test the scraper** with a small dataset
2. **Monitor for changes** in Blinkit's website structure
3. **Set up automated updates** using the scheduler
4. **Implement data quality checks**
5. **Consider reaching out to Blinkit** for official API access

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Blinkit's current HTML structure
3. Update selectors/endpoints accordingly
4. Consider using browser automation for complex cases

---

## ⚖️ Legal Disclaimer

This guide is provided for educational and research purposes only. Users are responsible for:

- Reviewing and complying with Blinkit's Terms of Service
- Ensuring their use case is legal and ethical
- Implementing proper rate limiting and respectful scraping practices
- Seeking official API access when possible

**The authors assume no liability for misuse of this information.**
