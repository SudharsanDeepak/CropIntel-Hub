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
const ML_API = process.env.ML_API_URL || "http://localhost:8000"

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://localhost',
      'https://cropintel-hub.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow mobile app (Capacitor) - no origin or capacitor:// scheme
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Allow Capacitor apps (they use capacitor://, ionic://, or https://localhost)
    if (origin.startsWith('capacitor://') || origin.startsWith('ionic://') || origin === 'https://localhost') {
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      console.log(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Platform'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // 24 hours
}));

// Additional CORS headers for mobile app
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin === 'https://localhost' || origin.startsWith('capacitor://') || origin.startsWith('ionic://')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Platform');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

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
const comparisonRoutes = require('./routes/comparisons');

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/comparisons', comparisonRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    message: "CropIntel HUB API",
    endpoints: {
      health: "/health",
      products: "/api/products/latest",
      auth: "/api/auth/*",
      alerts: "/api/alerts/*"
    }
  });
});

// Public monitoring stats endpoint (no auth required)
app.get("/api/monitoring/stats", async (req, res) => {
  try {
    const { getMonitoringStats } = require('./services/priceMonitor');
    const stats = getMonitoringStats();
    const Alert = require('./models/Alert');
    
    const totalActiveAlerts = await Alert.countDocuments({ status: 'active', triggered: false });
    const totalTriggeredAlerts = await Alert.countDocuments({ triggered: true });
    
    res.json({
      monitoring: stats,
      alerts: {
        active: totalActiveAlerts,
        triggered: totalTriggeredAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring stats' });
  }
});

// Test email endpoint (for debugging)
app.get("/api/test-email", async (req, res) => {
  try {
    const { sendPriceAlertEmail } = require('./services/priceAlertService');
    const result = await sendPriceAlertEmail(
      'sudharsansubramaniam3@gmail.com',
      'Test Product',
      100,
      120,
      'below'
    );
    res.json({ success: result.success, message: 'Email test completed', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: false,
        status: "unknown"
      },
      email: {
        configured: false,
        status: "unknown"
      },
      mlService: {
        url: ML_API,
        status: "unknown"
      }
    };

    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      health.database.connected = true;
      health.database.status = "connected";
    } else {
      health.database.status = `disconnected (state: ${mongoose.connection.readyState})`;
      health.status = "degraded";
    }

    // Check email configuration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD &&
        process.env.EMAIL_USER !== 'your-gmail@gmail.com') {
      health.email.configured = true;
      health.email.status = "configured";
    } else {
      health.email.status = "not configured (dev mode)";
    }

    // Check ML service
    try {
      const mlResponse = await axios.get(`${ML_API}/health`, { timeout: 5000 });
      health.mlService.status = "connected";
    } catch (error) {
      health.mlService.status = `unreachable: ${error.message}`;
      health.status = "degraded";
    }

    const statusCode = health.status === "ok" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
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
      timeout: 30000, // Increased to 30 seconds
    });
    res.json(response.data);
  } catch (error) {
    console.error("Products API Error:", error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: "Request timeout - ML service is taking longer than expected" });
    } else {
      res.status(500).json({ error: "Failed to fetch products", message: error.message });
    }
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
    
    // Handle 404 - must be after all other routes but before error handler
    app.use((req, res, next) => {
      // If it's an API route that doesn't exist, return 404
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({
          success: false,
          message: 'API endpoint not found',
          path: req.path
        });
      }
      // For non-API routes, pass to error handler
      next();
    });
    
    // Global error handler - must be after all routes
    app.use((err, req, res, next) => {
      console.error('❌ Unhandled Error:', err);
      console.error('Error stack:', err.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    app.listen(PORT, () => {
      console.log("========================================");
      console.log(`🚀 Node API running at http://localhost:${PORT}`);
      console.log(`🧠 ML Service connected at ${ML_API}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log("========================================");
      
      const { startPriceMonitoring } = require('./services/priceMonitor');
      startPriceMonitoring();
      
      // Heartbeat to prove server is alive
      setInterval(() => {
        console.log(`💓 Server heartbeat - Uptime: ${Math.floor(process.uptime())} seconds`);
      }, 60000); // Log every minute
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};
startServer();