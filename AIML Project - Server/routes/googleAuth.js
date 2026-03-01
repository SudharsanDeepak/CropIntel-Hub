const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const isGoogleOAuthConfigured = () => {
  return (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret-here'
  );
};
router.get('/google', (req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please add credentials to .env file.',
      hint: 'See GOOGLE_OAUTH_SETUP.md for instructions',
    });
  }
  
  // Store redirect type in session for callback
  if (req.query.redirect === 'app') {
    req.session = req.session || {}
    req.session.redirectToApp = true
  }
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
});
router.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
      const redirectToApp = req.session?.redirectToApp || false
      if (redirectToApp) {
        return res.redirect('cropintelhub://auth/callback?error=oauth_not_configured')
      }
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
    }
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173',
    session: false 
  }),
  (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User not found after OAuth')
      }

      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Check if this is a mobile app request
      const redirectToApp = req.session?.redirectToApp || false
      
      if (redirectToApp) {
        // Mobile app: Send HTML page that triggers deep link
        // This is more reliable than direct redirect for in-app browsers
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Successful</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              .spinner {
                border: 4px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top: 4px solid white;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="spinner"></div>
              <h2>Login Successful!</h2>
              <p>Returning to app...</p>
            </div>
            <script>
              // Try multiple methods to trigger the deep link
              const deepLink = 'cropintelhub://auth/callback?token=${token}';
              
              console.log('Triggering deep link:', deepLink);
              
              // Method 1: Direct window.location
              setTimeout(() => {
                window.location.href = deepLink;
              }, 500);
              
              // Method 2: Create invisible iframe (fallback)
              setTimeout(() => {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = deepLink;
                document.body.appendChild(iframe);
              }, 1000);
              
              // Method 3: Create link and click it (another fallback)
              setTimeout(() => {
                const link = document.createElement('a');
                link.href = deepLink;
                link.click();
              }, 1500);
            </script>
          </body>
          </html>
        `)
      } else {
        // Web: Redirect to website
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'
        res.redirect(`${frontendURL}/auth/callback?token=${token}`)
      }
    } catch (error) {
      console.error('Google Callback Error:', error);
      const redirectToApp = req.session?.redirectToApp || false
      if (redirectToApp) {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Login Failed</title>
          </head>
          <body>
            <h2>Login Failed</h2>
            <p>Please close this window and try again.</p>
            <script>
              setTimeout(() => {
                window.location.href = 'cropintelhub://auth/callback?error=auth_failed';
              }, 2000);
            </script>
          </body>
          </html>
        `)
      } else {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      }
    }
  }
);
module.exports = router;