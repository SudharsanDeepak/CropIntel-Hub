# CropIntel HUB - Smart Market Intelligence Platform

A comprehensive market intelligence platform for fruits and vegetables with AI-powered price tracking, demand forecasting, and real-time analytics.

## 🚀 Features

- **Real-Time Price Tracking**: Monitor live market prices for 180+ products
- **AI-Powered Forecasting**: 7-day demand and price predictions using ML models
- **Smart Chatbot**: Groq-powered Market Guide for instant product information
- **Price Alerts**: Get notified when prices reach your target levels
- **Product Comparison**: Compare multiple products side-by-side
- **Weather Impact Analysis**: See how weather affects market prices
- **Analytics Dashboard**: Comprehensive market insights and trends

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MongoDB Atlas account
- API Keys:
  - Groq API (for chatbot)
  - Google OAuth (for authentication)
  - OpenWeather API (for weather data)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AIML-Project
```

### 2. Frontend Setup

```bash
cd "AIML Project - Website"
npm install
cp .env.example .env
# Edit .env and add your API keys
npm run dev
```

### 3. Backend Setup

```bash
cd "AIML Project - Server"
npm install
cp .env.example .env
# Edit .env and add your configuration
npm start
```

### 4. ML Model Setup

```bash
cd "AIML Project - ML Model"
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your configuration
python ml_api.py
```

## 🔑 Environment Variables

### Frontend (.env)

- `VITE_API_URL`: Backend API URL
- `VITE_ML_API_URL`: ML API URL
- `VITE_GROQ_API_KEY`: Groq API key for chatbot
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_OPENWEATHER_API_KEY`: OpenWeather API key

### Backend (.env)

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `EMAIL_USER` & `EMAIL_PASSWORD`: Email configuration for OTP

### ML Model (.env)

- `MONGO_URI`: MongoDB connection string
- `ADMIN_API_KEY`: Admin API key for secure endpoints
- External API keys for data fetching

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
   ```bash
   cd "AIML Project - Website"
   npm run build
   ```

2. Deploy the `dist` folder to Vercel or Netlify

3. Set environment variables in your hosting platform

### Backend (Render/Railway)

1. Deploy from GitHub
2. Set environment variables
3. Use start command: `npm start`

### ML Model (Render/Railway)

1. Deploy from GitHub
2. Set environment variables
3. Use start command: `python ml_api.py`

## 📱 Usage

1. **Dashboard**: View market overview (public access)
2. **Sign Up/Login**: Create account to access all features
3. **Price Tracker**: Monitor real-time prices
4. **Forecast**: View 7-day predictions
5. **Alerts**: Set price alerts for products
6. **Compare**: Compare multiple products
7. **Analytics**: Deep market insights
8. **Market Guide**: Chat with AI assistant

## 🔒 Security

- All sensitive data is stored in `.env` files (not committed to Git)
- JWT-based authentication
- MongoDB Atlas with encrypted connections
- API key validation on all endpoints
- CORS configured for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Groq for fast AI inference
- MongoDB Atlas for database hosting
- OpenWeather for weather data
- Google for OAuth authentication
