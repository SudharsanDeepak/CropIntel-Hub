const nodemailer = require('nodemailer');
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};
const sendPriceAlertEmail = async (email, product, currentPrice, targetPrice, condition) => {
  try {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'your-gmail@gmail.com' ||
        process.env.EMAIL_PASSWORD === 'your-app-password-here') {
      console.log('⚠️  Email not configured - Alert triggered for:', email);
      console.log(`   Product: ${product}, Current: ₹${currentPrice}, Target: ₹${targetPrice}, Condition: ${condition}`);
      console.log('   Configure EMAIL_USER and EMAIL_PASSWORD in .env to send real emails');
      return { 
        success: true, 
        messageId: 'dev-mode-' + Date.now(),
        devMode: true
      };
    }
    const transporter = createTransporter();
    const priceDirection = condition === 'below' ? 'dropped below' : 'risen above';
    const emoji = condition === 'below' ? '📉' : '📈';
    const color = condition === 'below' ? '#10b981' : '#ef4444';
    const subject = `${emoji} Price Alert: ${product} ${priceDirection} ₹${targetPrice}/kg`;
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Price Alert</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f3f4f6;
            padding: 20px;
          }
          .email-wrapper { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header-icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-bottom: 16px;
          }
          .header h1 { 
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
          }
          .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 8px;
          }
          .content { 
            padding: 40px 30px;
          }
          .product-section {
            text-align: center;
            margin-bottom: 32px;
          }
          .product-name {
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
          }
          .product-status {
            display: inline-block;
            padding: 6px 16px;
            background: ${condition === 'below' ? '#d1fae5' : '#fee2e2'};
            color: ${condition === 'below' ? '#065f46' : '#991b1b'};
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .price-comparison {
            display: flex;
            gap: 16px;
            margin: 32px 0;
          }
          .price-card {
            flex: 1;
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
          }
          .price-card.highlight {
            background: ${condition === 'below' ? '#ecfdf5' : '#fef2f2'};
            border-color: ${condition === 'below' ? '#10b981' : '#ef4444'};
          }
          .price-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          .price-value {
            font-size: 36px;
            font-weight: 700;
            color: ${condition === 'below' ? '#10b981' : '#ef4444'};
            line-height: 1;
          }
          .price-unit {
            font-size: 16px;
            color: #9ca3af;
            font-weight: 500;
          }
          .message-box {
            background: ${condition === 'below' ? '#ecfdf5' : '#fef2f2'};
            border-left: 4px solid ${condition === 'below' ? '#10b981' : '#ef4444'};
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
          }
          .message-box p {
            color: #374151;
            font-size: 15px;
            margin: 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            margin: 24px 0;
            transition: transform 0.2s;
          }
          .info-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          .info-box p {
            color: #1e40af;
            font-size: 14px;
            margin: 0;
          }
          .footer {
            background: #f9fafb;
            padding: 32px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-brand {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
          }
          .footer-tagline {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .footer-links {
            margin: 20px 0;
          }
          .footer-links a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            margin: 0 12px;
            font-weight: 500;
          }
          @media only screen and (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 24px 20px; }
            .header { padding: 32px 20px; }
            .product-name { font-size: 24px; }
            .price-value { font-size: 28px; }
            .price-comparison { flex-direction: column; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Header -->
          <div class="header">
            <div class="header-icon">${emoji}</div>
            <h1>Price Alert Triggered</h1>
            <p>Your target price has been reached</p>
          </div>
          <!-- Content -->
          <div class="content">
            <!-- Product Section -->
            <div class="product-section">
              <div class="product-name">${product}</div>
              <div class="product-status">
                ${condition === 'below' ? '📉 Price Dropped' : '📈 Price Increased'}
              </div>
            </div>
            <!-- Price Comparison -->
            <div class="price-comparison">
              <div class="price-card highlight">
                <div class="price-label">Current Price</div>
                <div class="price-value">
                  ₹${currentPrice.toFixed(2)}
                  <span class="price-unit">/kg</span>
                </div>
              </div>
              <div class="price-card">
                <div class="price-label">Your Target</div>
                <div class="price-value" style="color: #6b7280;">
                  ₹${targetPrice.toFixed(2)}
                  <span class="price-unit">/kg</span>
                </div>
              </div>
            </div>
            <!-- Message -->
            <div class="message-box">
              <p>
                ${condition === 'below' 
                  ? '🎉 Great news! The price has dropped below your target. This could be a good opportunity to make a purchase.' 
                  : '⚠️ The price has risen above your target threshold. You may want to review your alert settings.'}
              </p>
            </div>
            
            <div style="text-align: center;">
              <a href="${FRONTEND_URL}/tracker" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0;">
                View Price Tracker →
              </a>
            </div>
            
            <div class="info-box">
              <p>
                <strong>💡 Tip:</strong> Market prices fluctuate throughout the day. Check the Price Tracker for real-time updates and 7-day forecasts.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-brand">CropIntel HUB</div>
            <div class="footer-tagline">AI-powered market insights for fruits & vegetables</div>
            <div class="footer-links">
              <a href="${FRONTEND_URL}/alerts">Manage Alerts</a>
              <a href="${FRONTEND_URL}/tracker">Price Tracker</a>
              <a href="${FRONTEND_URL}/forecast">Forecasts</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    const mailOptions = {
      from: `"CropIntel HUB - Price Alerts" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Price alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Price alert email failed:', error);
    return { success: false, error: error.message };
  }
};
module.exports = {
  sendPriceAlertEmail,
};