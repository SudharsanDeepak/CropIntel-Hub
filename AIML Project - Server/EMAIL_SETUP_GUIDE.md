# Email Notifications Setup Guide

## ✅ Price Alert System is Now Active!

Your Market Intelligence platform now has a **fully functional price alert system** with email notifications!

## 🎯 What's Working

### Backend Services
- ✅ **Alert API** - Create, read, update, delete alerts
- ✅ **MongoDB Storage** - Alerts saved to database
- ✅ **Price Monitoring** - Checks prices every hour
- ✅ **Email Service** - Sends beautiful HTML emails
- ✅ **Cron Job** - Automated background monitoring

### Features
- ✅ Create price alerts for any product
- ✅ Set "below" or "above" target price
- ✅ Email notifications when conditions are met
- ✅ Pause/resume alerts
- ✅ One-time or recurring notifications
- ✅ Beautiful HTML email templates

## 📧 Email Configuration

To send actual emails, you need to configure your email service in `.env`:

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Update `.env` file**:
```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Option 2: Other SMTP Services

For services like SendGrid, Mailgun, AWS SES:

```env
# Email Configuration
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-service.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

## 🚀 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                  Price Alert Flow                            │
└─────────────────────────────────────────────────────────────┘

1. User creates alert via frontend
   ├─ Product: Apple
   ├─ Target: ₹25/kg
   ├─ Condition: below
   └─ Email: user@example.com
        ↓
2. Alert saved to MongoDB
   └─ Status: active
        ↓
3. Cron job runs every hour
   ├─ Fetches current prices from ML API
   ├─ Checks all active alerts
   └─ Compares current vs target price
        ↓
4. If condition met:
   ├─ Sends email notification
   ├─ Updates alert status
   └─ Marks as triggered
        ↓
5. User receives beautiful email
   └─ "Apple price dropped to ₹24/kg!"
```

## 📅 Monitoring Schedule

**Default**: Every hour at minute 0
- 00:00, 01:00, 02:00, ... 23:00

**For Testing**: Uncomment this line in `services/priceMonitor.js`:
```javascript
// Run every 5 minutes for testing
cron.schedule('*/5 * * * *', () => {
  console.log(`\n⏰ Test check triggered at ${new Date().toLocaleString()}`);
  checkPriceAlerts();
});
```

## 🧪 Testing the System

### 1. Create a Test Alert

```bash
# Using curl
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Apple",
    "targetPrice": 30,
    "condition": "below",
    "email": "your-email@gmail.com",
    "notifyOnce": false
  }'
```

### 2. Check Server Logs

Watch the terminal for:
```
🔍 Checking price alerts...
   Found 1 active alert(s)
   🔔 Alert triggered: Apple below ₹30
   ✅ Email sent to your-email@gmail.com
```

### 3. Check Your Email

You should receive an email like:

```
Subject: 📉 Price Alert: Apple dropped below ₹30/kg

Great News!
The price for Apple has dropped below your target price.

Current Price: ₹28.50/kg
Your Target: ₹30.00/kg

🎉 This is a great opportunity to buy at a lower price!
```

## 📊 API Endpoints

### Get All Alerts
```
GET /api/alerts
GET /api/alerts?email=user@example.com
```

### Create Alert
```
POST /api/alerts
Body: {
  "product": "Apple",
  "targetPrice": 30,
  "condition": "below",
  "email": "user@example.com",
  "notifyOnce": false
}
```

### Update Alert
```
PUT /api/alerts/:id
Body: {
  "targetPrice": 25,
  "status": "active"
}
```

### Delete Alert
```
DELETE /api/alerts/:id
```

### Toggle Alert (Pause/Resume)
```
PATCH /api/alerts/:id/toggle
```

## 🎨 Email Template

The system sends beautiful HTML emails with:
- ✅ Gradient header
- ✅ Product name and prices
- ✅ Visual price comparison
- ✅ Call-to-action button
- ✅ Quick tips
- ✅ Responsive design
- ✅ Professional branding

## 🔧 Troubleshooting

### Emails Not Sending?

**Check 1: Email Configuration**
```bash
# In .env file
EMAIL_USER=your-email@gmail.com  # Must be valid
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # Must be app password
```

**Check 2: Server Logs**
```
⚠️  Email not configured - Alert triggered for: user@example.com
```
This means email credentials are not set up.

**Check 3: Gmail App Password**
- Must use App Password, not regular password
- Enable 2FA first
- Generate new app password if expired

### Alerts Not Triggering?

**Check 1: Alert Status**
```bash
# Make sure alert is active
curl http://localhost:5000/api/alerts
```

**Check 2: Price Condition**
```
Current Price: ₹35/kg
Target Price: ₹30/kg
Condition: below

❌ Won't trigger (35 is not below 30)
```

**Check 3: Already Triggered**
```
triggered: true
notifyOnce: true

❌ Won't trigger again (one-time notification)
```

### Manual Testing

Trigger a manual price check:
```javascript
// In Node.js console or add to index.js
const { triggerManualCheck } = require('./services/priceMonitor');
triggerManualCheck();
```

## 📈 Production Deployment

### 1. Use Environment Variables
```env
# Production email service
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### 2. Update Email Links
In `services/priceAlertService.js`, replace:
```javascript
// Change from localhost to production URL
href="https://your-domain.com/tracker"
```

### 3. Monitor Logs
```bash
# Use PM2 or similar
pm2 start index.js --name market-api
pm2 logs market-api
```

### 4. Set Up Email Limits
```javascript
// Add rate limiting in priceMonitor.js
const MAX_EMAILS_PER_HOUR = 100;
```

## 🎉 Success Indicators

When everything is working, you'll see:

**Server Startup:**
```
🚀 PRICE ALERT MONITORING STARTED
📅 Schedule: Every hour (at minute 0)
📧 Email notifications: Enabled
```

**Hourly Checks:**
```
⏰ Scheduled check triggered at 2/21/2024, 3:00:00 PM
🔍 Checking price alerts...
   Found 5 active alert(s)
   🔔 Alert triggered: Apple below ₹30
   ✅ Email sent to user@example.com
✅ Price check complete: 1 alert(s) triggered
```

**User Experience:**
1. User creates alert in frontend
2. Alert saved to database
3. System monitors prices automatically
4. Email sent when condition met
5. User receives notification
6. Alert status updated

## 🔐 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use app passwords**, not regular passwords
3. **Validate email addresses** before sending
4. **Rate limit** email sending
5. **Log all email attempts** for debugging
6. **Use HTTPS** in production
7. **Sanitize user inputs** in alerts

## 📝 Summary

✅ **Backend**: Fully implemented with MongoDB, cron jobs, and email service
✅ **Frontend**: Updated to use backend API instead of localStorage
✅ **Monitoring**: Automated hourly price checks
✅ **Emails**: Beautiful HTML templates ready to send
✅ **Testing**: Works in development mode without email config

**Next Step**: Configure your email credentials in `.env` and test!

---

**Status**: 🎉 Price Alert System is Production-Ready!

Just add your email credentials and you're good to go!
