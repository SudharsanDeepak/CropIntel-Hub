"""
Keep Render Services Active
Pings your Render services every 5 minutes to prevent them from sleeping.
Run this script on your local machine or any server that's always on.
"""
import requests
import time
from datetime import datetime
import sys

# ⚠️ IMPORTANT: Replace these with your actual Render URLs
BACKEND_URL = "https://your-backend.onrender.com/health"
ML_API_URL = "https://your-ml-api.onrender.com/health"

# Configuration
PING_INTERVAL = 300  # 5 minutes (in seconds)
TIMEOUT = 30  # Request timeout (in seconds)

def ping_service(url, name):
    """Ping a service and return status"""
    try:
        start_time = time.time()
        response = requests.get(url, timeout=TIMEOUT)
        response_time = round((time.time() - start_time) * 1000, 2)  # Convert to ms
        
        if response.status_code == 200:
            status = "✅ Active"
            color = "\033[92m"  # Green
        else:
            status = f"⚠️  Status {response.status_code}"
            color = "\033[93m"  # Yellow
        
        reset = "\033[0m"
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"{color}[{timestamp}] {name}: {status} ({response_time}ms){reset}")
        return True
    except requests.exceptions.Timeout:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"\033[91m[{timestamp}] {name}: ❌ Timeout (>{TIMEOUT}s)\033[0m")
        return False
    except requests.exceptions.ConnectionError:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"\033[91m[{timestamp}] {name}: ❌ Connection Error\033[0m")
        return False
    except Exception as e:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"\033[91m[{timestamp}] {name}: ❌ Error - {str(e)}\033[0m")
        return False

def validate_urls():
    """Validate that URLs have been configured"""
    if "your-backend" in BACKEND_URL or "your-ml-api" in ML_API_URL:
        print("\n" + "=" * 70)
        print("⚠️  ERROR: Please configure your Render URLs first!")
        print("=" * 70)
        print("\nOpen this file and replace:")
        print(f"  BACKEND_URL = '{BACKEND_URL}'")
        print(f"  ML_API_URL = '{ML_API_URL}'")
        print("\nWith your actual Render URLs:")
        print("  BACKEND_URL = 'https://cropintelhub-backend.onrender.com/health'")
        print("  ML_API_URL = 'https://cropintelhub-ml.onrender.com/health'")
        print("\n" + "=" * 70 + "\n")
        sys.exit(1)

def main():
    """Main function"""
    validate_urls()
    
    print("\n" + "=" * 70)
    print("🔄 RENDER KEEP-ALIVE SERVICE")
    print("=" * 70)
    print(f"\n📍 Backend Server: {BACKEND_URL}")
    print(f"📍 ML API Server:  {ML_API_URL}")
    print(f"\n⏱️  Ping interval: Every {PING_INTERVAL // 60} minutes")
    print(f"⏱️  Timeout: {TIMEOUT} seconds")
    print("\n💡 Press Ctrl+C to stop")
    print("=" * 70 + "\n")
    
    ping_count = 0
    success_count = 0
    
    try:
        while True:
            ping_count += 1
            print(f"\n🔔 Ping #{ping_count}")
            print("-" * 70)
            
            # Ping backend
            backend_success = ping_service(BACKEND_URL, "Backend Server")
            time.sleep(2)  # Small delay between pings
            
            # Ping ML API
            ml_success = ping_service(ML_API_URL, "ML API Server")
            
            if backend_success and ml_success:
                success_count += 1
            
            # Calculate uptime
            uptime_percent = (success_count / ping_count) * 100 if ping_count > 0 else 0
            
            print("-" * 70)
            print(f"📊 Stats: {success_count}/{ping_count} successful ({uptime_percent:.1f}% uptime)")
            print(f"⏰ Next ping in {PING_INTERVAL // 60} minutes...")
            print()
            
            # Wait for next ping
            time.sleep(PING_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print("⏹️  Service stopped by user")
        print("=" * 70)
        print(f"\n📊 Final Stats:")
        print(f"   Total pings: {ping_count}")
        print(f"   Successful: {success_count}")
        print(f"   Failed: {ping_count - success_count}")
        if ping_count > 0:
            uptime_percent = (success_count / ping_count) * 100
            print(f"   Uptime: {uptime_percent:.1f}%")
        print("\n✅ Goodbye!\n")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {str(e)}")
        print("💡 Check your internet connection and Render URLs\n")

if __name__ == "__main__":
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("\n❌ Error: 'requests' library not found")
        print("\n💡 Install it with: pip install requests\n")
        sys.exit(1)
    
    main()
