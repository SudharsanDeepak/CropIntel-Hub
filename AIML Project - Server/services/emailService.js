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
const sendOTPEmail = async (email, otp, purpose) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'your-gmail@gmail.com' ||
        process.env.EMAIL_PASSWORD === 'your-app-password-here') {
      console.log('⚠️  Email not configured - OTP:', otp);
      console.log('   Configure EMAIL_USER and EMAIL_PASSWORD in .env to send real emails');
      console.log(`   For testing: Use OTP ${otp} for ${email}`);
      return { 
        success: true, 
        messageId: 'dev-mode-' + Date.now(),
        devMode: true,
        otp: otp 
      };
    }
    
    const transporter = createTransporter();
    let subject, html;
    if (purpose === 'signup') {
      subject = 'Verify Your Email - CropIntel HUB';
      html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Verify Your Email</title>
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
            .content h2 {
              color: #111827;
              font-size: 20px;
              margin-bottom: 16px;
              font-weight: 600;
            }
            .content p {
              color: #6b7280;
              font-size: 15px;
              margin-bottom: 24px;
            }
            .otp-container {
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 32px 24px;
              text-align: center;
              margin: 32px 0;
            }
            .otp-label {
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #6b7280;
              margin-bottom: 16px;
            }
            .otp-code { 
              font-size: 48px; 
              font-weight: 700; 
              letter-spacing: 16px;
              color: #667eea; 
              font-family: 'Courier New', monospace;
              white-space: nowrap;
              display: inline-block;
            }
            .validity {
              text-align: center;
              margin: 24px 0;
              padding: 16px;
              background: #eff6ff;
              border-radius: 8px;
            }
            .validity p {
              color: #1e40af;
              font-size: 14px;
              margin: 0;
            }
            .validity strong {
              color: #1e3a8a;
              font-weight: 600;
            }
            .warning { 
              background: #fef3c7; 
              border-left: 4px solid #f59e0b; 
              padding: 16px 20px;
              margin: 24px 0;
              border-radius: 8px;
            }
            .warning p {
              color: #92400e;
              margin: 0;
              font-size: 14px;
            }
            .warning strong {
              color: #78350f;
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
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
            @media only screen and (max-width: 600px) {
              body { padding: 10px; }
              .content { padding: 24px 20px; }
              .header { padding: 32px 20px; }
              .otp-code { font-size: 36px; letter-spacing: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="header-icon">🔐</div>
              <h1>Verify Your Email</h1>
              <p>Complete your registration</p>
            </div>
            <div class="content">
              <h2>Welcome to CropIntel HUB!</h2>
              <p>Thank you for signing up. To complete your registration and secure your account, please verify your email address using the code below:</p>
              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              <div class="validity">
                <p><strong>⏱️ Valid for 10 minutes</strong></p>
                <p>This code will expire after 10 minutes for security reasons.</p>
              </div>
              <div class="warning">
                <strong>🔒 Security Notice</strong>
                <p>Never share this code with anyone. Our team will never ask for your verification code.</p>
              </div>
              <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
            </div>
            <div class="footer">
              <div class="footer-brand">CropIntel HUB</div>
              <div class="footer-tagline">AI-powered market insights for fruits & vegetables</div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (purpose === 'login') {
      subject = 'Your Login Code - CropIntel HUB';
      html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Login Verification</title>
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
            .content h2 {
              color: #111827;
              font-size: 20px;
              margin-bottom: 16px;
              font-weight: 600;
            }
            .content p {
              color: #6b7280;
              font-size: 15px;
              margin-bottom: 24px;
            }
            .otp-container {
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 32px 24px;
              text-align: center;
              margin: 32px 0;
            }
            .otp-label {
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #6b7280;
              margin-bottom: 16px;
            }
            .otp-code { 
              font-size: 48px; 
              font-weight: 700; 
              letter-spacing: 16px;
              color: #667eea; 
              font-family: 'Courier New', monospace;
              white-space: nowrap;
              display: inline-block;
            }
            .validity {
              text-align: center;
              margin: 24px 0;
              padding: 16px;
              background: #eff6ff;
              border-radius: 8px;
            }
            .validity p {
              color: #1e40af;
              font-size: 14px;
              margin: 0;
            }
            .validity strong {
              color: #1e3a8a;
              font-weight: 600;
            }
            .warning { 
              background: #fef3c7; 
              border-left: 4px solid #f59e0b; 
              padding: 16px 20px;
              margin: 24px 0;
              border-radius: 8px;
            }
            .warning p {
              color: #92400e;
              margin: 0;
              font-size: 14px;
            }
            .warning strong {
              color: #78350f;
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
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
            @media only screen and (max-width: 600px) {
              body { padding: 10px; }
              .content { padding: 24px 20px; }
              .header { padding: 32px 20px; }
              .otp-code { font-size: 36px; letter-spacing: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="header-icon">🔑</div>
              <h1>Login Verification</h1>
              <p>Secure access to your account</p>
            </div>
            <div class="content">
              <h2>Welcome Back!</h2>
              <p>We received a login request for your account. Use the verification code below to complete your sign-in:</p>
              <div class="otp-container">
                <div class="otp-label">Your Login Code</div>
                <div class="otp-code">${otp}</div>
              </div>
              <div class="validity">
                <p><strong>⏱️ Valid for 10 minutes</strong></p>
                <p>This code will expire after 10 minutes for security reasons.</p>
              </div>
              <div class="warning">
                <strong>🔒 Security Notice</strong>
                <p>If you didn't attempt to log in, please secure your account immediately and contact our support team.</p>
              </div>
              <p>For your security, never share this code with anyone, including our support team.</p>
            </div>
            <div class="footer">
              <div class="footer-brand">CropIntel HUB</div>
              <div class="footer-tagline">AI-powered market insights for fruits & vegetables</div>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    const mailOptions = {
      from: `"CropIntel HUB" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};
module.exports = {
  sendOTPEmail,
};