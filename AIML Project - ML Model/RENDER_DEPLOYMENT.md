# Render Deployment Guide for ML API

## Quick Setup (Copy-Paste Ready)

### Step 1: Create New Web Service on Render
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `SudharsanDeepak/CropIntel-Hub`
4. Select the repository

### Step 2: Configure Build Settings
- **Name**: `cropintel-hub-ml`
- **Root Directory**: `AIML Project - ML Model`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn ml_api:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables
Click "Add Environment Variable" and add these:

**Variable 1:**
- Key: `MONGO_URI`
- Value: `mongodb+srv://SudharsanDeepak:sudharsan@cluster0.g6tkwcc.mongodb.net/market_analyzer`

**Variable 2:**
- Key: `ADMIN_API_KEY`
- Value: `cropintelhub_admin`

**Variable 3:**
- Key: `DATA_UPDATE_INTERVAL`
- Value: `0.0833`

### Step 4: Deploy
Click "Create Web Service" and wait for deployment to complete.

### Step 5: Populate Database
Once deployed, run this command in your terminal:

```bash
curl -H "X-API-Key: cropintelhub_admin" https://cropintel-hub-ml.onrender.com/data/populate
```

Or open this URL in Postman with header `X-API-Key: cropintelhub_admin`

## Troubleshooting

### Issue: "Connection to localhost:27017 refused"
**Solution**: Make sure `MONGO_URI` environment variable is set correctly in Render dashboard.

### Issue: "403 Forbidden" on /data/populate
**Solution**: Add header `X-API-Key: cropintelhub_admin` to your request.

### Issue: "500 Internal Server Error"
**Solution**: Check Render logs for specific error. Usually means database is empty - run `/data/populate` endpoint.
