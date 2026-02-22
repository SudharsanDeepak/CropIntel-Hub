# CropIntel HUB - Complete Deployment Guide

## 📋 Table of Contents
1. [Development Setup](#development-setup)
2. [Production Deployment](#production-deployment)
3. [Environment Variables](#environment-variables)
4. [Troubleshooting](#troubleshooting)

---

## 🛠️ Development Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB Atlas account
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/SudharsanDeepak/CropIntel-Hub.git
cd CropIntel-Hub
```

### Step 2: Setup Environment Variables

**For Windows:**
```bash
setup-env.bat
```

**For Linux/Mac:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

Choose option `1` for Development when prompted.

This will automatically create `.env` files in all three folders with the correct configuration for local development.

### Step 3: ML Model Setup
```bash
cd "AIML Project - ML Model"
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn ml_api:app --reload --port 8000
```

### Step 4: Backend Server Setup
```bash
cd "AIML Project - Server"
npm install
npm start
```

### Step 5: Frontend Setup
```bash
cd "AIML Project - Website"
npm install
npm run dev
```

### Access Development:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- ML API: http://localhost:8000

---

## 🚀 Production Deployment

### Architecture
- **ML API**: Render (Python)
- **Backend**: Render (Node.js)
- **Frontend**: Netlify (React)
- **Database**: MongoDB Atlas

### Step 1: Deploy ML API to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `SudharsanDeepak/CropIntel-Hub`
4. Configure:
   - **Name**: `cropintel-hub-ml`
   - **Root Directory**: `AIML Project - ML Model`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn ml_api:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://SudharsanDeepak:sudharsan@cluster0.g6tkwcc.mongodb.net/market_analyzer
   ADMIN_API_KEY=cropintelhub_admin
   DATA_UPDATE_INTERVAL=24
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Note the URL: `https://cropintel-hub-ml.onrender.com`

### Step 2: Deploy Backend to Render

1. Click "New +" → "Web Service"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `cropintel-hub-bnd`
   - **Root Directory**: `AIML Project - Server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

4. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://SudharsanDeepak:sudharsan@cluster0.g6tkwcc.mongodb.net/market_analyzer
   ML_API_URL=https://cropintel-hub-ml.onrender.com
   JWT_SECRET=d0DMcYfCoQSL8PgsEZRqvlt6y9kjaIwWTu2bVA7pHBzneX4JU1FrK5hGi3NxmO
   SESSION_SECRET=xWBnoES4CYVliXNcIrhuR8AfJLwPQ9qeK0OGkTm2d1vMDsFtaZj6bU573pyzgH
   FRONTEND_URL=https://cropintel-hub.netlify.app
   EMAIL_USER=sudharsandeepak12@gmail.com
   EMAIL_PASSWORD=pvquvritqgsenqeb
   PORT=10000
   ```

5. Click "Create Web Service"
6. Note the URL: `https://cropintel-hub-bnd.onrender.com`

### Step 3: Deploy Frontend to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - **Base directory**: `AIML Project - Website`
   - **Build command**: `npm run build`
   - **Publish directory**: `AIML Project - Website/dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://cropintel-hub-bnd.onrender.com
   VITE_ML_API_URL=https://cropintel-hub-ml.onrender.com
   VITE_GOOGLE_CLIENT_ID=1070647166169-tigbet01bnt6shvg3t3279h9g05pf7u7.apps.googleusercontent.com
   VITE_DEV_MODE=false
   VITE_LOG_LEVEL=error
   ```

6. Click "Deploy site"
7. Note the URL: `https://cropintel-hub.netlify.app`

### Step 4: Update Backend CORS

After getting the Netlify URL, update the backend CORS settings:
1. Go to Render → Backend Service → Environment
2. Update `FRONTEND_URL` to your Netlify URL
3. Redeploy

---

## 🔐 Environment Variables

### ML API (Render)
| Variable | Development | Production | Required |
|----------|-------------|------------|----------|
| MONGO_URI | MongoDB Atlas URL | MongoDB Atlas URL | ✅ |
| ADMIN_API_KEY | cropintelhub_admin | cropintelhub_admin | ✅ |
| DATA_UPDATE_INTERVAL | 0.0833 (5 min) | 24 (daily) | ❌ |

### Backend (Render)
| Variable | Development | Production | Required |
|----------|-------------|------------|----------|
| MONGODB_URI | MongoDB Atlas URL | MongoDB Atlas URL | ✅ |
| ML_API_URL | http://localhost:8000 | https://cropintel-hub-ml.onrender.com | ✅ |
| FRONTEND_URL | http://localhost:5173 | https://cropintel-hub.netlify.app | ✅ |
| JWT_SECRET | Random string | Random string | ✅ |
| EMAIL_USER | Your Gmail | Your Gmail | ✅ |
| EMAIL_PASSWORD | App password | App password | ✅ |
| PORT | 5000 | 10000 | ✅ |

### Frontend (Netlify)
| Variable | Development | Production | Required |
|----------|-------------|------------|----------|
| VITE_API_URL | http://localhost:5000 | https://cropintel-hub-bnd.onrender.com | ✅ |
| VITE_ML_API_URL | http://localhost:8000 | https://cropintel-hub-ml.onrender.com | ✅ |
| VITE_DEV_MODE | true | false | ❌ |
| VITE_LOG_LEVEL | info | error | ❌ |

---

## 🔧 Troubleshooting

### Issue: 500 Errors on Frontend
**Cause**: ML API has no data in database
**Solution**: 
```bash
curl -H "X-API-Key: cropintelhub_admin" https://cropintel-hub-ml.onrender.com/data/populate
```

### Issue: CORS Errors
**Cause**: Backend CORS not configured for frontend URL
**Solution**: Update `FRONTEND_URL` in backend environment variables

### Issue: MongoDB Connection Failed
**Cause**: Wrong MongoDB URI or missing database name
**Solution**: Ensure URI ends with `/market_analyzer`

### Issue: ML API Not Starting
**Cause**: Missing environment variables
**Solution**: Check Render logs and add missing variables

### Issue: Email Not Sending
**Cause**: Gmail app password not set
**Solution**: Generate app password from Google Account settings

---

## 📊 Monitoring

### Check ML API Health
```bash
curl https://cropintel-hub-ml.onrender.com/
```

### Check Backend Health
```bash
curl https://cropintel-hub-bnd.onrender.com/
```

### Check Database Records
```bash
curl https://cropintel-hub-ml.onrender.com/products/latest
```

---

## 🔄 Updates

### To Update Code:
1. Push changes to GitHub
2. Render auto-deploys (if enabled)
3. Netlify auto-deploys (if enabled)
4. Or manually trigger deploy from dashboard

### To Update Environment Variables:
1. Go to service dashboard
2. Navigate to Environment tab
3. Update variables
4. Service will auto-redeploy

---

## 📞 Support

For issues, check:
1. Render deployment logs
2. Netlify deployment logs
3. Browser console errors
4. MongoDB Atlas connection status

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] ML API deployed to Render
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Netlify
- [ ] All environment variables set
- [ ] Database populated with data
- [ ] CORS configured correctly
- [ ] Email service configured
- [ ] All services health checked
- [ ] Frontend loads without errors
