================================================================================
                            CROPINTEL HUB
          Smart Market Intelligence for Fruits & Vegetables
================================================================================

PROJECT OVERVIEW
================================================================================

CropIntel Hub is an AI-powered market intelligence platform designed to help
farmers, vendors, and agricultural businesses make data-driven decisions about
fruit and vegetable pricing, demand forecasting, and inventory optimization.

The system uses machine learning models to predict market trends, optimize
stock levels, and provide real-time price recommendations based on multiple
data sources including government APIs, weather data, and market conditions.


SYSTEM ARCHITECTURE
================================================================================

The project consists of three main components:

1. ML API SERVICE (Python/FastAPI)
   - Machine learning models for demand and price forecasting
   - Real-time data fetching from multiple sources
   - Stock optimization algorithms
   - Automated daily market updates

2. BACKEND SERVER (Node.js/Express)
   - User authentication (Email OTP + Google OAuth)
   - RESTful API for frontend communication
   - MongoDB database management
   - Email notification service
   - Price alert monitoring system

3. FRONTEND WEBSITE (React/Vite)
   - Modern, responsive user interface
   - Interactive dashboards and analytics
   - Real-time data visualization
   - Weather integration
   - AI-powered market guide chatbot


CORE FEATURES
================================================================================

1. DEMAND FORECASTING
   - Predicts future demand for 180+ products
   - Uses historical sales data and market trends
   - Considers seasonal patterns and weather conditions
   - Provides confidence intervals for predictions

2. DYNAMIC PRICING
   - Real-time price recommendations
   - Market-driven pricing strategies
   - Competitor price analysis
   - Price elasticity calculations

3. INVENTORY OPTIMIZATION
   - Smart stock level recommendations
   - Minimizes waste and stockouts
   - Considers shelf life and demand patterns
   - Automated reorder point calculations

4. MARKET ANALYTICS
   - Comprehensive market insights dashboard
   - Price trend visualization
   - Demand pattern analysis
   - Comparative market analysis

5. WEATHER INTEGRATION
   - Real-time weather data for 180+ cities
   - 24-hour hourly forecasts
   - Air quality index monitoring
   - Weather impact on market prices

6. AI MARKET GUIDE
   - Conversational AI assistant (Groq LLaMA 3.3)
   - Market insights and recommendations
   - Price trend explanations
   - Business strategy suggestions

7. PRICE ALERTS
   - Customizable price monitoring
   - Email notifications for price changes
   - Threshold-based alerts
   - Multi-product tracking

8. USER AUTHENTICATION
   - Secure email OTP verification
   - Google OAuth integration
   - JWT-based session management
   - Role-based access control


TECHNOLOGY STACK
================================================================================

MACHINE LEARNING SERVICE:
- Python 3.11+
- FastAPI (Web framework)
- Scikit-learn (ML models)
- Pandas & NumPy (Data processing)
- PyMongo (MongoDB driver)
- Schedule (Task scheduling)
- BeautifulSoup4 (Web scraping)

BACKEND SERVER:
- Node.js 18+
- Express.js (Web framework)
- MongoDB (Database)
- Passport.js (Authentication)
- JWT (Token management)
- Nodemailer (Email service)
- Bcrypt (Password hashing)

FRONTEND:
- React 18
- Vite (Build tool)
- Tailwind CSS (Styling)
- Recharts (Data visualization)
- Axios (HTTP client)
- React Router (Navigation)
- React Hot Toast (Notifications)

EXTERNAL APIS:
- Agmarknet API (Indian government market data)
- USDA API (US agriculture data)
- OpenWeather API (Weather data)
- Groq API (AI chatbot - LLaMA 3.3)
- Google OAuth API (Authentication)


DATA SOURCES
================================================================================

1. AGMARKNET API
   - Official Indian government agricultural market data
   - Real-time commodity prices from mandis across India
   - Historical price trends
   - Market arrival data

2. USDA API
   - United States Department of Agriculture data
   - Global agricultural statistics
   - Crop production reports
   - Market news and analysis

3. OPENWEATHER API
   - Current weather conditions
   - 24-hour forecasts
   - Air quality index
   - Temperature, humidity, pressure data

4. BLINKIT API (Optional)
   - Real-time grocery prices
   - Product availability
   - Delivery zone pricing
   - Competitive pricing data


MACHINE LEARNING MODELS
================================================================================

1. DEMAND FORECASTING MODEL
   Algorithm: Random Forest Regressor
   Features:
   - Historical sales data
   - Seasonal patterns (day, month, quarter)
   - Weather conditions (temperature, humidity)
   - Market trends
   - Holiday indicators
   
   Output:
   - Predicted demand quantity
   - Confidence intervals
   - Trend direction

2. PRICE PREDICTION MODEL
   Algorithm: Gradient Boosting Regressor
   Features:
   - Current market prices
   - Supply and demand metrics
   - Seasonal factors
   - Weather impact
   - Historical price patterns
   
   Output:
   - Recommended selling price
   - Price range (min-max)
   - Profit margin estimates

3. STOCK OPTIMIZATION MODEL
   Algorithm: Linear Programming
   Constraints:
   - Storage capacity
   - Budget limitations
   - Shelf life
   - Minimum stock levels
   
   Output:
   - Optimal order quantities
   - Reorder points
   - Safety stock levels
   - Expected profit


DATABASE SCHEMA
================================================================================

USERS COLLECTION:
- _id: ObjectId
- name: String
- email: String (unique)
- password: String (hashed)
- googleId: String (optional)
- avatar: String (URL)
- authProvider: String (local/google)
- createdAt: Date

SALES COLLECTION:
- _id: ObjectId
- product_name: String
- category: String
- quantity: Number
- price: Number
- date: Date
- location: String
- weather_temp: Number
- weather_humidity: Number
- demand_forecast: Number
- price_recommendation: Number

ALERTS COLLECTION:
- _id: ObjectId
- userId: ObjectId (ref: Users)
- productName: String
- targetPrice: Number
- currentPrice: Number
- condition: String (above/below)
- isActive: Boolean
- createdAt: Date

OTP COLLECTION:
- _id: ObjectId
- email: String
- otp: String
- purpose: String (signup/login)
- createdAt: Date
- expiresAt: Date (5 minutes)


SYSTEM WORKFLOW
================================================================================

1. DATA COLLECTION (Daily at 6 AM)
   - Scheduler triggers data fetching
   - Fetches prices from Agmarknet API
   - Retrieves weather data from OpenWeather
   - Collects USDA market reports
   - Stores data in MongoDB

2. MODEL TRAINING (Weekly)
   - Loads historical data from database
   - Performs feature engineering
   - Trains demand forecasting model
   - Trains price prediction model
   - Saves models as .pkl files

3. PREDICTION GENERATION (On-demand)
   - User requests forecast via API
   - Loads trained models
   - Prepares input features
   - Generates predictions
   - Returns results with confidence scores

4. STOCK OPTIMIZATION (Real-time)
   - Analyzes current inventory levels
   - Considers demand forecasts
   - Applies optimization algorithms
   - Generates reorder recommendations
   - Calculates expected profits

5. PRICE MONITORING (Continuous)
   - Checks current market prices every hour
   - Compares with user-set alert thresholds
   - Triggers email notifications
   - Updates alert status in database
   - Logs price changes

6. USER AUTHENTICATION FLOW
   
   EMAIL SIGNUP:
   - User enters email and password
   - System generates 6-digit OTP
   - Sends OTP via email (Gmail SMTP)
   - User verifies OTP within 5 minutes
   - Creates account and issues JWT token
   
   GOOGLE OAUTH:
   - User clicks "Sign in with Google"
   - Redirects to Google consent screen
   - Google authenticates user
   - Redirects to backend callback
   - Backend creates/updates user
   - Issues JWT token
   - Redirects to frontend with token


SECURITY FEATURES
================================================================================

1. PASSWORD SECURITY
   - Bcrypt hashing (10 salt rounds)
   - No plain text storage
   - Secure password validation

2. TOKEN MANAGEMENT
   - JWT with 7-day expiration
   - Secure secret keys (256-bit)
   - Token refresh mechanism
   - Automatic logout on expiry

3. API SECURITY
   - CORS configuration
   - Rate limiting
   - Input validation
   - SQL injection prevention
   - XSS protection

4. DATA ENCRYPTION
   - HTTPS/TLS for all communications
   - Environment variable protection
   - Secure cookie handling
   - MongoDB connection encryption

5. AUTHENTICATION
   - Multi-factor with OTP
   - OAuth 2.0 integration
   - Session management
   - Protected routes


DEPLOYMENT ARCHITECTURE
================================================================================

PRODUCTION ENVIRONMENT:

1. ML API SERVICE
   Platform: Render (Free Tier)
   URL: https://cropintel-hub-ml.onrender.com
   Runtime: Python 3.11
   Start Command: uvicorn ml_api:app --host 0.0.0.0 --port $PORT
   Auto-sleep: 15 minutes inactivity
   Keep-alive: UptimeRobot (5-minute pings)

2. BACKEND SERVER
   Platform: Render (Free Tier)
   URL: https://cropintel-hub-bnd.onrender.com
   Runtime: Node.js 18
   Start Command: node index.js
   Auto-sleep: 15 minutes inactivity
   Keep-alive: UptimeRobot (5-minute pings)

3. FRONTEND WEBSITE
   Platform: Netlify (Free Tier)
   URL: https://cropintel-hub.netlify.app
   Build: npm run build
   Output: dist/
   CDN: Global edge network
   Auto-deploy: On GitHub push

4. DATABASE
   Platform: MongoDB Atlas (Free Tier)
   Cluster: M0 Sandbox (512 MB)
   Region: AWS Mumbai
   Backup: Automatic snapshots
   Network: 0.0.0.0/0 (all IPs allowed)

5. MONITORING
   Service: UptimeRobot (Free)
   Check Interval: 5 minutes
   Endpoints:
   - ML API: /health
   - Backend: /health
   Notifications: Email alerts


ENVIRONMENT VARIABLES
================================================================================

ML API (.env):
- MONGO_URI: MongoDB connection string
- ADMIN_API_KEY: API authentication key
- AGMARKNET_API_KEY: Government market data API
- USDA_API_KEY: USDA agriculture data API
- OPENWEATHER_API_KEY: Weather data API
- DATA_UPDATE_INTERVAL: Update frequency (hours)

BACKEND SERVER (.env):
- MONGO_URI: MongoDB connection string
- PORT: Server port (5000)
- NODE_ENV: Environment (production/development)
- BACKEND_URL: Backend service URL
- ML_API_URL: ML service URL
- FRONTEND_URL: Frontend website URL
- JWT_SECRET: Token signing secret
- SESSION_SECRET: Session encryption key
- GOOGLE_CLIENT_ID: OAuth client ID
- GOOGLE_CLIENT_SECRET: OAuth client secret
- EMAIL_SERVICE: Email provider (gmail)
- EMAIL_USER: Sender email address
- EMAIL_PASSWORD: App-specific password

FRONTEND (.env):
- VITE_API_URL: Backend API URL
- VITE_ML_API_URL: ML API URL
- VITE_GROQ_API_KEY: AI chatbot API key
- VITE_GOOGLE_CLIENT_ID: OAuth client ID
- VITE_OPENWEATHER_API_KEY: Weather API key
- VITE_APP_NAME: Application name
- VITE_ENABLE_GOOGLE_AUTH: Enable OAuth (true/false)
- VITE_DEV_MODE: Development mode (true/false)


API ENDPOINTS
================================================================================

ML API ENDPOINTS:

GET /health
- Health check endpoint
- Returns: Service status

POST /predict/demand
- Predict product demand
- Body: { product_name, date, location, weather }
- Returns: Demand forecast with confidence

POST /predict/price
- Predict optimal price
- Body: { product_name, current_price, demand }
- Returns: Price recommendation

POST /optimize/stock
- Optimize inventory levels
- Body: { products[], budget, capacity }
- Returns: Optimal order quantities

GET /products
- List all tracked products
- Returns: Array of 180+ products

POST /update/market-data
- Trigger manual data update
- Requires: Admin API key
- Returns: Update status


BACKEND API ENDPOINTS:

Authentication:
POST /api/auth/send-otp-signup
POST /api/auth/verify-otp-signup
POST /api/auth/send-otp-login
POST /api/auth/verify-otp-login
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/me

Sales Data:
GET /api/sales
POST /api/sales
GET /api/sales/:id
PUT /api/sales/:id
DELETE /api/sales/:id

Price Alerts:
GET /api/alerts
POST /api/alerts
PUT /api/alerts/:id
DELETE /api/alerts/:id

Market Comparison:
GET /api/comparison
POST /api/comparison/analyze

ML Integration:
POST /api/ml/demand-forecast
POST /api/ml/price-recommendation
POST /api/ml/stock-optimization


USER INTERFACE PAGES
================================================================================

1. DASHBOARD (Public)
   - Overview of market trends
   - Key metrics and statistics
   - Featured products
   - Quick insights
   - Call-to-action for signup

2. ANALYTICS (Protected)
   - Demand forecasting charts
   - Price trend analysis
   - Product performance metrics
   - Weather integration
   - Comparative analysis

3. INVENTORY (Protected)
   - Current stock levels
   - Reorder recommendations
   - Stock optimization
   - Low stock alerts
   - Inventory value tracking

4. PRICING (Protected)
   - Dynamic pricing recommendations
   - Price elasticity analysis
   - Competitor pricing
   - Profit margin calculator
   - Historical price trends

5. MARKET GUIDE (Protected)
   - AI-powered chatbot
   - Market insights
   - Strategy recommendations
   - Price explanations
   - Business advice

6. ALERTS (Protected)
   - Price alert management
   - Create new alerts
   - Active alerts list
   - Alert history
   - Notification settings


PERFORMANCE OPTIMIZATIONS
================================================================================

1. FRONTEND OPTIMIZATIONS
   - Code splitting with React.lazy()
   - Image lazy loading
   - Debounced search inputs
   - Memoized components
   - Virtual scrolling for large lists
   - Service worker caching
   - Gzip compression

2. BACKEND OPTIMIZATIONS
   - MongoDB indexing on frequently queried fields
   - Connection pooling
   - Response caching
   - Async/await for non-blocking operations
   - Request rate limiting
   - Payload compression

3. ML API OPTIMIZATIONS
   - Model caching in memory
   - Batch prediction processing
   - Feature preprocessing optimization
   - Pickle serialization for models
   - Async data fetching
   - Database query optimization

4. DATABASE OPTIMIZATIONS
   - Compound indexes on common queries
   - TTL indexes for OTP expiration
   - Aggregation pipeline optimization
   - Projection to limit returned fields
   - Connection string optimization


MONITORING & LOGGING
================================================================================

1. APPLICATION LOGS
   - Request/response logging
   - Error tracking with stack traces
   - Performance metrics
   - User activity logs
   - API usage statistics

2. HEALTH CHECKS
   - Service availability monitoring
   - Database connection status
   - API endpoint health
   - Model loading verification
   - External API connectivity

3. ALERTS & NOTIFICATIONS
   - Service downtime alerts
   - Error rate thresholds
   - Performance degradation
   - Database connection failures
   - API quota warnings

4. ANALYTICS
   - User engagement metrics
   - Feature usage statistics
   - API call patterns
   - Error frequency analysis
   - Performance benchmarks


SCALABILITY CONSIDERATIONS
================================================================================

1. HORIZONTAL SCALING
   - Stateless backend design
   - Load balancer ready
   - Session management via JWT
   - Database connection pooling
   - Microservices architecture

2. VERTICAL SCALING
   - Optimized resource usage
   - Memory-efficient algorithms
   - CPU-optimized computations
   - Database query optimization
   - Caching strategies

3. DATA SCALING
   - Partitioned collections
   - Archived historical data
   - Indexed queries
   - Aggregation optimization
   - Sharding ready design


FUTURE ENHANCEMENTS
================================================================================

1. REAL-TIME DATA
   - Live market prices from government sources
   - Weather-integrated forecasting
   - Continuous model updates
   - Automated data collection

2. AI-POWERED INSIGHTS
   - Machine learning predictions
   - Conversational AI assistant
   - Personalized recommendations
   - Trend analysis

3. COMPREHENSIVE COVERAGE
   - 180+ products tracked
   - Multiple data sources
   - Pan-India market data
   - Weather integration

4. USER-FRIENDLY INTERFACE
   - Modern, intuitive design
   - Mobile-responsive
   - Easy navigation
   - Visual analytics

5. FREE TO START
   - No upfront costs
   - Freemium model
   - Scalable pricing
   - Risk-free trial

6. SECURE & RELIABLE
   - Enterprise-grade security
   - 99.9% uptime target
   - Data encryption
   - Regular backups


TECHNICAL CHALLENGES SOLVED
================================================================================

1. DATA QUALITY
   Challenge: Inconsistent data from multiple sources
   Solution: Data validation, cleaning, and normalization pipelines

2. MODEL ACCURACY
   Challenge: Volatile market conditions
   Solution: Ensemble models, regular retraining, confidence intervals

3. SCALABILITY
   Challenge: Growing user base and data volume
   Solution: Microservices architecture, database optimization, caching

4. REAL-TIME UPDATES
   Challenge: Fresh data for accurate predictions
   Solution: Scheduled tasks, webhook integrations, streaming data

5. USER EXPERIENCE
   Challenge: Complex data presented simply
   Solution: Interactive visualizations, AI assistant, guided workflows

6. COST OPTIMIZATION
   Challenge: Free tier sustainability
   Solution: Efficient resource usage, serverless functions, caching


DEVELOPMENT WORKFLOW
================================================================================

1. VERSION CONTROL
   - Git for source control
   - GitHub for repository hosting
   - Feature branch workflow
   - Pull request reviews
   - Semantic versioning

2. CONTINUOUS INTEGRATION
   - Automated testing
   - Code quality checks
   - Dependency scanning
   - Build verification
   - Deployment automation

3. TESTING STRATEGY
   - Unit tests for business logic
   - Integration tests for APIs
   - End-to-end tests for workflows
   - Performance testing
   - Security testing

4. DEPLOYMENT PIPELINE
   - GitHub → Render (Backend & ML)
   - GitHub → Netlify (Frontend)
   - Automatic deployments on push
   - Environment-specific configs
   - Rollback capabilities


PROJECT STRUCTURE
================================================================================

AIML Project - ML Model/
├── data/                      # Sample data files
├── data_sources/              # Data fetching modules
│   ├── agmarknet_api.py      # Government market data
│   ├── usda_api.py           # USDA agriculture data
│   ├── weather_fetcher.py    # Weather data
│   ├── blinkit_fetcher.py    # Grocery prices
│   └── scheduler.py          # Automated updates
├── forecasting/              # ML models
│   ├── demand_model.py       # Demand forecasting
│   └── forecast_generator.py # Prediction generation
├── pricing/                  # Pricing algorithms
│   ├── price_model.py        # Price prediction
│   └── elasticity.py         # Price elasticity
├── optimization/             # Stock optimization
│   └── stock_optimizer.py    # Inventory optimization
├── preprocessing/            # Data processing
│   ├── load_data.py          # Data loading
│   └── feature_engineering.py # Feature creation
├── models/                   # Trained model files
│   ├── demand_model.pkl
│   └── price_model.pkl
├── ml_api.py                 # FastAPI application
├── requirements.txt          # Python dependencies
└── .env                      # Environment variables

AIML Project - Server/
├── config/                   # Configuration files
│   ├── db.js                 # MongoDB connection
│   └── passport.js           # OAuth configuration
├── models/                   # Database models
│   ├── User.js               # User schema
│   ├── Sales.js              # Sales data schema
│   ├── Alert.js              # Price alert schema
│   └── OTP.js                # OTP schema
├── routes/                   # API routes
│   ├── auth.js               # Authentication routes
│   ├── googleAuth.js         # OAuth routes
│   ├── sales.js              # Sales data routes
│   └── alerts.js             # Alert routes
├── middleware/               # Custom middleware
│   └── auth.js               # JWT verification
├── services/                 # Business logic
│   ├── emailService.js       # Email sending
│   ├── priceMonitor.js       # Price monitoring
│   └── priceAlertService.js  # Alert management
├── ml_services/              # ML API integration
│   ├── demandService.js      # Demand forecasting
│   ├── priceService.js       # Price prediction
│   └── stockService.js       # Stock optimization
├── index.js                  # Express application
├── package.json              # Node dependencies
└── .env                      # Environment variables

AIML Project - Website/
├── public/                   # Static assets
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── components/           # React components
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── Auth/
│   │   │   ├── LoginModal.jsx
│   │   │   └── SignupModal.jsx
│   │   ├── Charts/
│   │   │   ├── DemandChart.jsx
│   │   │   └── PriceChart.jsx
│   │   └── MarketGuide.jsx   # AI chatbot
│   ├── pages/                # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Analytics.jsx
│   │   ├── Inventory.jsx
│   │   ├── Pricing.jsx
│   │   └── AuthCallback.jsx
│   ├── context/              # React context
│   │   └── AuthContext.jsx   # Authentication state
│   ├── App.jsx               # Main application
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
└── .env                      # Environment variables


DEPENDENCIES
================================================================================

ML API (Python):
- fastapi==0.115.0           # Web framework
- uvicorn==0.30.6            # ASGI server
- pandas>=2.2.0              # Data manipulation
- numpy>=1.26.0              # Numerical computing
- scikit-learn>=1.5.0        # Machine learning
- joblib>=1.4.0              # Model serialization
- pymongo>=4.8.0             # MongoDB driver
- python-dotenv>=1.0.0       # Environment variables
- requests>=2.32.0           # HTTP requests
- beautifulsoup4>=4.12.0     # Web scraping
- schedule>=1.2.0            # Task scheduling

Backend (Node.js):
- express: ^4.18.2           # Web framework
- mongoose: ^8.0.0           # MongoDB ODM
- passport: ^0.7.0           # Authentication
- passport-google-oauth20    # Google OAuth
- jsonwebtoken: ^9.0.2       # JWT tokens
- bcryptjs: ^2.4.3           # Password hashing
- nodemailer: ^6.9.7         # Email service
- cors: ^2.8.5               # CORS middleware
- dotenv: ^16.3.1            # Environment variables
- axios: ^1.6.2              # HTTP client

Frontend (React):
- react: ^18.2.0             # UI library
- react-dom: ^18.2.0         # React DOM
- react-router-dom: ^6.20.0  # Routing
- axios: ^1.6.2              # HTTP client
- recharts: ^2.10.3          # Charts
- react-hot-toast: ^2.4.1    # Notifications
- lucide-react: ^0.294.0     # Icons
- tailwindcss: ^3.3.6        # CSS framework


SYSTEM REQUIREMENTS
================================================================================

DEVELOPMENT ENVIRONMENT:
- Operating System: Windows 10/11, macOS, or Linux
- Python: 3.11 or higher
- Node.js: 18.x or higher
- MongoDB: 6.0 or higher (or MongoDB Atlas)
- Git: 2.x or higher
- Code Editor: VS Code (recommended)
- RAM: Minimum 8GB (16GB recommended)
- Storage: 5GB free space

PRODUCTION ENVIRONMENT:
- Render Free Tier (ML API & Backend)
- Netlify Free Tier (Frontend)
- MongoDB Atlas M0 Free Tier
- UptimeRobot Free Tier (Monitoring)

BROWSER SUPPORT:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)


INSTALLATION & SETUP
================================================================================

LOCAL DEVELOPMENT:

1. Clone Repository:
   git clone https://github.com/SudharsanDeepak/CropIntel-Hub.git
   cd CropIntel-Hub

2. Setup ML API:
   cd "AIML Project - ML Model"
   python -m venv .venv
   .venv\Scripts\activate  (Windows)
   source .venv/bin/activate  (Mac/Linux)
   pip install -r requirements.txt
   Copy .env.example to .env and configure
   uvicorn ml_api:app --reload --port 8000

3. Setup Backend:
   cd "AIML Project - Server"
   npm install
   Copy .env.example to .env and configure
   node index.js

4. Setup Frontend:
   cd "AIML Project - Website"
   npm install
   Copy .env.example to .env and configure
   npm run dev

5. Access Application:
   Frontend: http://localhost:5173
   Backend: http://localhost:5000
   ML API: http://localhost:8000


CONFIGURATION GUIDE
================================================================================

1. MONGODB SETUP:
   - Create MongoDB Atlas account
   - Create free M0 cluster
   - Get connection string
   - Add to MONGO_URI in .env files
   - Configure network access (0.0.0.0/0)

2. GOOGLE OAUTH SETUP:
   - Go to Google Cloud Console
   - Create new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized origins and redirect URIs
   - Copy Client ID and Secret to .env

3. EMAIL SERVICE SETUP:
   - Use Gmail account
   - Enable 2-factor authentication
   - Generate app-specific password
   - Add to EMAIL_USER and EMAIL_PASSWORD

4. API KEYS SETUP:
   - Agmarknet: Register at data.gov.in
   - USDA: Register at USDA API portal
   - OpenWeather: Register at openweathermap.org
   - Groq: Register at console.groq.com


TROUBLESHOOTING
================================================================================

Common Issues:

1. MongoDB Connection Failed
   - Check MONGO_URI format
   - Verify network access settings
   - Ensure IP whitelist includes 0.0.0.0/0

2. Google OAuth Not Working
   - Verify redirect URIs in Google Console
   - Check FRONTEND_URL has no trailing slash
   - Ensure NODE_ENV=production in Render

3. OTP Email Not Received
   - Check spam folder
   - Verify EMAIL_PASSWORD is app password
   - Check Gmail account security settings

4. ML API Slow Response
   - Models loading on first request (normal)
   - Check Render service is awake
   - Verify UptimeRobot is pinging

5. Frontend Build Fails
   - Clear node_modules and reinstall
   - Check Node.js version (18+)
   - Verify all environment variables set

6. CORS Errors
   - Check FRONTEND_URL in backend .env
   - Verify CORS configuration in index.js
   - Ensure URLs match exactly


MAINTENANCE & UPDATES
================================================================================

DAILY TASKS:
- Monitor service uptime (UptimeRobot)
- Check error logs in Render
- Verify data updates completed
- Review user feedback

WEEKLY TASKS:
- Retrain ML models with new data
- Review prediction accuracy
- Update product catalog
- Backup database

MONTHLY TASKS:
- Security updates for dependencies
- Performance optimization review
- User analytics analysis
- Feature usage statistics

QUARTERLY TASKS:
- Major feature releases
- Model architecture improvements
- User survey and feedback
- Competitive analysis


SUPPORT & DOCUMENTATION
================================================================================

DOCUMENTATION FILES:
- README.txt (This file)
- DEPLOYMENT_ISSUES_FIX.md
- RENDER_BACKEND_ENV_FIX.md
- NETLIFY_ENV_FIX.md
- GOOGLE_OAUTH_REDIRECT_FIX.md
- COPY_PASTE_ENV_VARIABLES.md
- KEEP_RENDER_ACTIVE.md
- DAILY_UPDATE_SETUP.md
- API_TESTING_GUIDE.md

CONTACT INFORMATION:
- Developer: Sudharsan Deepak S
- Email: sudharsandeepak12@gmail.com
- GitHub: https://github.com/SudharsanDeepak
- Project Repository: https://github.com/SudharsanDeepak/CropIntel-Hub

LIVE URLS:
- Frontend: https://cropintel-hub.netlify.app
- Backend API: https://cropintel-hub-bnd.onrender.com
- ML API: https://cropintel-hub-ml.onrender.com


LICENSE & USAGE
================================================================================

This project is developed for educational and commercial purposes.

PERMITTED USES:
- Personal learning and development
- Commercial deployment with attribution
- Modification and customization
- Integration with other systems

RESTRICTIONS:
- Must maintain attribution to original developer
- Cannot claim as original work
- Cannot redistribute as template without permission
- Must comply with third-party API terms of service


ACKNOWLEDGMENTS
================================================================================

DATA SOURCES:
- Agmarknet (Government of India)
- USDA (United States Department of Agriculture)
- OpenWeather API
- Groq AI (LLaMA 3.3)

TECHNOLOGIES:
- FastAPI Framework
- Express.js Framework
- React Library
- MongoDB Database
- Scikit-learn Library
- Tailwind CSS

HOSTING PLATFORMS:
- Render (Backend & ML API)
- Netlify (Frontend)
- MongoDB Atlas (Database)
- UptimeRobot (Monitoring)


PROJECT STATISTICS
================================================================================

Lines of Code: ~15,000+
- Python: ~5,000 lines
- JavaScript: ~8,000 lines
- CSS/Tailwind: ~2,000 lines

Files: 100+
- Python files: 25+
- JavaScript files: 50+
- Configuration files: 25+

Features: 20+
- Authentication methods: 2
- ML models: 3
- API endpoints: 30+
- UI pages: 8

Products Tracked: 180+
Data Sources: 4
External APIs: 5


DEVELOPMENT TIMELINE
================================================================================

Phase 1 - Foundation (Weeks 1-2):
- Project setup and architecture
- Database schema design
- Basic authentication system
- Frontend layout and navigation

Phase 2 - Core Features (Weeks 3-4):
- ML model development
- Data fetching pipelines
- API integration
- Dashboard implementation

Phase 3 - Advanced Features (Weeks 5-6):
- Price alert system
- Stock optimization
- Weather integration
- AI chatbot integration

Phase 4 - Polish & Deploy (Weeks 7-8):
- UI/UX improvements
- Performance optimization
- Testing and bug fixes
- Production deployment

Phase 5 - Post-Launch (Ongoing):
- User feedback integration
- Feature enhancements
- Model improvements
- Documentation updates


SUCCESS METRICS
================================================================================

TECHNICAL METRICS:
- API Response Time: <500ms (95th percentile)
- Model Accuracy: >85% for demand forecasting
- System Uptime: >99.5%
- Page Load Time: <2 seconds
- Error Rate: <1%

BUSINESS METRICS:
- User Registrations: Target 1000+ in first 3 months
- Daily Active Users: Target 100+ after 6 months
- Prediction Requests: Target 10,000+ per month
- User Retention: Target 60% after 30 days
- Premium Conversion: Target 5% of free users


CONCLUSION
================================================================================

CropIntel Hub represents a comprehensive solution for agricultural market
intelligence, combining modern web technologies with advanced machine learning
to provide actionable insights for farmers, vendors, and agricultural
businesses.

The platform demonstrates the practical application of AI/ML in solving
real-world problems in the agricultural sector, with a focus on accessibility,
accuracy, and user experience.

With its scalable architecture, robust security, and continuous improvement
approach, CropIntel Hub is positioned to become a valuable tool for
data-driven decision-making in the agricultural market.


================================================================================
                        END OF DOCUMENTATION
================================================================================

For the latest updates and detailed guides, please refer to the project
repository and documentation files.

Last Updated: February 2026
Version: 1.0.0
