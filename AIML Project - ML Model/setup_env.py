import os

print("=" * 60)
print("🔧 ENVIRONMENT SETUP")
print("=" * 60)

required_vars = {
    "MONGO_URI": "MongoDB connection string",
    "ADMIN_API_KEY": "Admin API key for protected endpoints"
}

missing_vars = []
for var, description in required_vars.items():
    value = os.getenv(var)
    if value:
        masked = value[:20] + "..." if len(value) > 20 else value
        print(f"✅ {var}: {masked}")
    else:
        print(f"❌ {var}: NOT SET ({description})")
        missing_vars.append(var)

if missing_vars:
    print("\n⚠️  WARNING: Missing environment variables!")
    print("Please set these in Render dashboard:")
    for var in missing_vars:
        print(f"   - {var}")
else:
    print("\n✅ All required environment variables are set!")

print("=" * 60)
