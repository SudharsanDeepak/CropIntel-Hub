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
        // Mobile app: Redirect to deep link
        res.redirect(`cropintelhub://auth/callback?token=${token}`)
      } else {
        // Web: Redirect to website
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'
        res.redirect(`${frontendURL}/auth/callback?token=${token}`)
      }
    } catch (error) {
      console.error('Google Callback Error:', error);
      const redirectToApp = req.session?.redirectToApp || false
      if (redirectToApp) {
        res.redirect('cropintelhub://auth/callback?error=auth_failed')
      } else {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      }
    }
  }
);
module.exports = router;