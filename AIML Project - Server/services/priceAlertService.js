const nodemailer = require('nodemailer');
const createTransporter = () => {
  const normalizedUser = String(process.env.EMAIL_USER || '').trim();
  const normalizedPassword = String(process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');

  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: normalizedUser,
        pass: normalizedPassword,
      },
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5,
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: false,
      logger: false
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: normalizedUser,
      pass: normalizedPassword,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  });
};
const sendPriceAlertEmail = async (email, product, currentPrice, targetPrice, condition) => {
  try {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    console.log(`📧 Attempting to send email to: ${email}`);
    console.log(`   EMAIL_USER configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`);
    console.log(`   EMAIL_PASSWORD configured: ${process.env.EMAIL_PASSWORD ? 'Yes (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'No'}`);
    console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'Not set'}`);
    
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
    
    console.log(`📤 Creating email transporter...`);
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
          html { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f3f4f6;
            padding: 0;
            margin: 0;
            width: 100%;
            min-height: 100vh;
          }
          table { border-collapse: collapse; border-spacing: 0; width: 100%; }
          td, th { vertical-align: top; }
          img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: nearest-neighbor; }
          
          /* Container */
          .email-wrapper { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          
          /* Header */
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 48px 24px;
            text-align: center;
          }
          .header-icon {
            width: 70px;
            height: 70px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            margin: 0 auto 16px;
            line-height: 1;
          }
          .header h1 { 
            color: #ffffff;
            font-size: 26px;
            font-weight: 700;
            margin: 0 0 8px 0;
            line-height: 1.3;
          }
          .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 15px;
            margin: 0;
            line-height: 1.4;
          }
          
          /* Content */
          .content { 
            padding: 32px 24px;
          }
          .product-section {
            text-align: center;
            margin-bottom: 28px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 24px;
          }
          .product-name {
            font-size: 28px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 12px;
            line-height: 1.2;
            word-break: break-word;
          }
          .product-status {
            display: inline-block;
            padding: 6px 14px;
            background: ${condition === 'below' ? '#d1fae5' : '#fee2e2'};
            color: ${condition === 'below' ? '#065f46' : '#991b1b'};
            border-radius: 16px;
            font-size: 13px;
            font-weight: 600;
            line-height: 1;
            white-space: nowrap;
          }
          
          /* Price Cards */
          .price-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin: 28px 0;
          }
          .price-card {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px 16px;
            text-align: center;
            transition: all 0.3s ease;
          }
          .price-card.highlight {
            background: ${condition === 'below' ? '#ecfdf5' : '#fef2f2'};
            border-color: ${condition === 'below' ? '#10b981' : '#ef4444'};
            box-shadow: 0 2px 8px ${condition === 'below' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
          }
          .price-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 8px;
            display: block;
          }
          .price-value {
            font-size: 32px;
            font-weight: 700;
            color: ${condition === 'below' ? '#10b981' : '#ef4444'};
            line-height: 1;
            margin-bottom: 4px;
          }
          .price-unit {
            font-size: 14px;
            color: #9ca3af;
            font-weight: 500;
            display: block;
          }
          
          /* Message Box */
          .message-box {
            background: ${condition === 'below' ? '#f0fdf4' : '#fef2f2'};
            border-left: 4px solid ${condition === 'below' ? '#10b981' : '#ef4444'};
            border-radius: 8px;
            padding: 18px 16px;
            margin: 24px 0;
          }
          .message-box p {
            color: #374151;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
          }
          
          /* CTA Button */
          .cta-button-wrapper {
            text-align: center;
            margin: 28px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 14px 36px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            line-height: 1;
            border: none;
            cursor: pointer;
            transition: transform 0.2s ease;
            min-width: 140px;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          
          /* Info Box */
          .info-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
          }
          .info-box p {
            color: #1e40af;
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
          }
          
          /* Footer */
          .footer {
            background: #f9fafb;
            padding: 28px 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-brand {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 6px;
            line-height: 1;
          }
          .footer-tagline {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 16px;
            line-height: 1.4;
          }
          .footer-links {
            margin: 0;
            padding: 0;
          }
          .footer-links a {
            color: #667eea;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            display: inline-block;
            margin: 0 8px;
            line-height: 1.6;
          }
          
          /* Mobile Responsiveness */
          @media only screen and (max-width: 640px) {
            body { padding: 8px; }
            .email-wrapper { border-radius: 8px; }
            .header { 
              padding: 36px 16px; 
              border-radius: 8px 8px 0 0;
            }
            .header-icon {
              width: 60px;
              height: 60px;
              font-size: 32px;
              margin-bottom: 12px;
            }
            .header h1 { font-size: 22px; }
            .header p { font-size: 14px; }
            .content { 
              padding: 24px 16px; 
            }
            .product-section {
              margin-bottom: 20px;
              padding-bottom: 18px;
            }
            .product-name { 
              font-size: 24px; 
              margin-bottom: 10px;
            }
            .price-comparison {
              gap: 12px;
              margin: 20px 0;
            }
            .price-card {
              padding: 18px 14px;
            }
            .price-label { font-size: 10px; }
            .price-value { 
              font-size: 26px; 
              margin-bottom: 3px;
            }
            .price-unit { font-size: 12px; }
            .message-box {
              padding: 16px 14px;
              margin: 20px 0;
            }
            .message-box p { font-size: 13px; }
            .cta-button-wrapper { margin: 20px 0; }
            .cta-button {
              padding: 12px 32px;
              font-size: 14px;
              min-width: 120px;
              width: 100%;
              max-width: 240px;
            }
            .info-box {
              padding: 14px;
              margin: 20px 0;
            }
            .info-box p { font-size: 12px; }
            .footer { 
              padding: 24px 16px; 
            }
            .footer-brand { font-size: 16px; }
            .footer-tagline { font-size: 12px; }
            .footer-links a { 
              font-size: 12px;
              margin: 0 6px;
              display: block;
              margin-bottom: 6px;
            }
          }
          
          /* Tablet Responsiveness */
          @media only screen and (max-width: 480px) {
            .header h1 { font-size: 20px; }
            .product-name { font-size: 22px; }
            .price-value { font-size: 24px; }
            .price-comparison {
              gap: 10px;
            }
            .price-card {
              padding: 16px 12px;
            }
            .content { padding: 20px 14px; }
          }
          
          /* High Resolution Displays */
          @media only screen and (-webkit-min-device-pixel-ratio: 2) and (max-width: 600px) {
            .email-wrapper {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            }
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
    
    console.log(`📨 Sending email...`);
    console.log(`   From: ${process.env.EMAIL_USER}`);
    console.log(`   To: ${email}`);
    console.log(`   Subject: ${subject}`);
    
    // Set a timeout for email sending (30 seconds)
    const sendEmailWithTimeout = Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout after 30 seconds')), 30000)
      )
    ]);
    
    const info = await sendEmailWithTimeout;
    
    console.log('✅ Price alert email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response || 'No response'}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Price alert email failed!');
    console.error(`   Error type: ${error.name}`);
    console.error(`   Error message: ${error.message}`);
    console.error(`   Error code: ${error.code || 'N/A'}`);
    console.error(`   Full error:`, error);
    return { success: false, error: error.message };
  }
};
module.exports = {
  sendPriceAlertEmail,
};