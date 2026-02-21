require("dotenv").config();
const mongoose = require("mongoose");
async function testConnection() {
  console.log("=".repeat(50));
  console.log("Testing MongoDB Connection from Node Server");
  console.log("=".repeat(50));
  const mongoUri = process.env.MONGO_URI;
  console.log(`\n📍 MongoDB URI: ${mongoUri.substring(0, 30)}...`);
  try {
    console.log("\n🔄 Attempting to connect...");
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ Connection successful!`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    const collections = await conn.connection.db.listCollections().toArray();
    const salesExists = collections.some((col) => col.name === "sales");
    if (salesExists) {
      const count = await conn.connection.db.collection("sales").countDocuments();
      console.log(`📊 Sales collection found with ${count} documents`);
    } else {
      console.log("⚠️  Sales collection not found");
      console.log("💡 Run migrate_csv_to_mongo.py from ML service to populate data");
    }
    await mongoose.connection.close();
    console.log("\n✅ Test completed successfully");
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Check if MONGO_URI is set in .env file");
    console.log("   2. Verify MongoDB Atlas credentials");
    console.log("   3. Check network connectivity");
    console.log("   4. Ensure IP address is whitelisted in MongoDB Atlas");
  }
  process.exit(0);
}
testConnection();