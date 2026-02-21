"""
Fallback web scraper for market data when APIs are unavailable.
Scrapes public agricultural market websites.
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import time
class FallbackScraper:
    """
    Web scraper for agricultural market data.
    Use only when official APIs are unavailable.
    """
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    def scrape_agmarknet_website(self, commodity):
        """
        Scrape Agmarknet website for commodity prices.
        URL: https://agmarknet.gov.in/
        """
        try:
            url = f"https://agmarknet.gov.in/SearchCmmMkt.aspx?Tx_Commodity={commodity}"
            response = requests.get(url, headers=self.headers, timeout=15)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                table = soup.find('table', {'id': 'cphBody_GridPriceData'})
                if table:
                    records = []
                    rows = table.find_all('tr')[1:]
                    for row in rows:
                        cols = row.find_all('td')
                        if len(cols) >= 5:
                            records.append({
                                'date': datetime.now(),
                                'product': commodity,
                                'market': cols[0].text.strip(),
                                'price': self._parse_price(cols[4].text.strip()),
                                'quantity': 100,
                                'stock': 100,
                                'source': 'agmarknet_scrape'
                            })
                    return records
            return None
        except Exception as e:
            print(f"❌ Scraping failed: {str(e)}")
            return None
    def _parse_price(self, price_str):
        """Extract numeric price from string"""
        import re
        numbers = re.findall(r'\d+\.?\d*', price_str)
        return float(numbers[0]) if numbers else 0.0
    def scrape_multiple_commodities(self, commodities):
        """
        Scrape data for multiple commodities with rate limiting.
        """
        all_records = []
        for commodity in commodities:
            print(f"🔍 Scraping: {commodity}")
            records = self.scrape_agmarknet_website(commodity)
            if records:
                all_records.extend(records)
                print(f"   ✅ Found {len(records)} records")
            time.sleep(2)
        return all_records
if __name__ == "__main__":
    scraper = FallbackScraper()
    commodities = ["Tomato", "Potato", "Onion"]
    data = scraper.scrape_multiple_commodities(commodities)
    if data:
        df = pd.DataFrame(data)
        print("\n📊 Scraped Data:")
        print(df)