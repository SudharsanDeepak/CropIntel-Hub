require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const Sales = require("./models/Sales");
const app = express();
const PORT = process.env.PORT || 5000;
const ML_API = process.env.ML_API_URL || "https://cropintel-hub-ml.onrender.com"

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://cropintel-hub.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

const MongoStore = require('connect-mongo');

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 24 * 3600
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/googleAuth');
const alertRoutes = require('./routes/alerts');
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/alerts', alertRoutes);
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Node API Running",
    ml_service: ML_API,
  });
});
app.get("/api/products/latest", async (req, res) => {
  try {
    const { limit, category, search } = req.query;
    const params = {};
    if (limit) params.limit = limit;
    if (category) params.category = category;
    if (search) params.search = search;
    const response = await axios.get(`${ML_API}/products/latest`, {
      params,
      timeout: 10000, 
    });
    res.json(response.data);
  } catch (error) {
    console.error("Products API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch products", message: error.message });
  }
});
app.get("/api/products/:productName/forecast", async (req, res) => {
  try {
    const { productName } = req.params;
    const days = req.query.days || 7;
    const response = await axios.get(`${ML_API}/products/${encodeURIComponent(productName)}/forecast`, {
      params: { days },
      timeout: 5000, 
    });
    res.json(response.data);
  } catch (error) {
    console.error("Product Forecast Error:", error.message);
    res.status(500).json({ error: "Failed to fetch forecast", message: error.message });
  }
});
app.get("/api/demand", async (req, res) => {
  try {
    const days = req.query.days || 7;
    const response = await axios.get(`${ML_API}/forecast/demand`, {
      params: { days },
      timeout: 120000, 
    });
    res.json(response.data);
  } catch (error) {
    console.error("Demand API Error:", error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: "Request timeout - ML service is processing large dataset" });
    } else {
      res.status(500).json({ error: "Demand service error", message: error.message });
    }
  }
});
app.get("/api/price", async (req, res) => {
  try {
    const days = req.query.days || 7;
    const response = await axios.get(`${ML_API}/forecast/price`, {
      params: { days },
      timeout: 120000, 
    });
    res.json(response.data);
  } catch (error) {
    console.error("Price API Error:", error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: "Request timeout - ML service is processing large dataset" });
    } else {
      res.status(500).json({ error: "Price service error", message: error.message });
    }
  }
});
app.get("/api/stock", async (req, res) => {
  try {
    const days = req.query.days || 7;
    const response = await axios.get(`${ML_API}/analysis/stock`, {
      params: { days },
      timeout: 60000, 
    });
    res.json(response.data);
  } catch (error) {
    console.error("Stock API Error:", error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: "Request timeout - ML service is processing large dataset" });
    } else {
      res.status(500).json({ error: "Stock service error", message: error.message });
    }
  }
});
app.get("/api/elasticity", async (req, res) => {
  try {
    const response = await axios.get(`${ML_API}/analysis/elasticity`, {
      timeout: 60000, 
    });
    res.json(response.data);
  } catch (error) {
    console.error("Elasticity API Error:", error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: "Request timeout - ML service is processing large dataset" });
    } else {
      res.status(500).json({ error: "Elasticity service error", message: error.message });
    }
  }
});
app.post("/api/data/update", async (req, res) => {
  try {
    const response = await axios.post(`${ML_API}/data/update`, {}, {
      timeout: 180000, 
    });
    res.json(response.data);
  } catch (error) {
    console.error("Data Update Error:", error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: "Request timeout - Data update takes longer for 180 products" });
    } else {
      res.status(500).json({ error: "Failed to update market data", message: error.message });
    }
  }
});
app.get("/api/data/sources", async (req, res) => {
  try {
    const response = await axios.get(`${ML_API}/data/sources`);
    res.json(response.data);
  } catch (error) {
    console.error("Data Sources Error:", error.message);
    res.status(500).json({ error: "Failed to fetch data sources" });
  }
});
app.post("/api/sales", async (req, res) => {
  try {
    const { product, quantity, price, stock } = req.body;
    const newSale = new Sales({
      product,
      quantity,
      price,
      stock
    });
    await newSale.save();
    res.json({
      status: "success",
      message: "Sales data saved successfully"
    });
  } catch (error) {
    console.error("Sales Save Error:", error.message);
    res.status(500).json({ error: "Failed to save sales data" });
  }
});
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("========================================");
      console.log(`🚀 Node API running at http://localhost:${PORT}`);
      console.log(`🧠 ML Service connected at ${ML_API}`);
      console.log("========================================");
      
      const { startPriceMonitoring } = require('./services/priceMonitor');
      startPriceMonitoring();
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};
startServer();