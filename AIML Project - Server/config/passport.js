const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Determine the correct callback URL based on environment
const getCallbackURL = () => {
  // If BACKEND_URL is explicitly set, use it (production)
  if (process.env.BACKEND_URL && process.env.BACKEND_URL !== 'http://localhost:5000') {
    return `${process.env.BACKEND_URL}/api/auth/google/callback`;
  }
  
  // Check if we're in production by NODE_ENV
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production: Use deployed backend URL
    return `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;
  } else {
    // Development: Use localhost
    return `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`;
  }
};

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here' &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret-here'
) {
  const callbackURL = getCallbackURL();
  
  console.log(`🔐 Google OAuth Configuration:`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Callback URL: ${callbackURL}`);
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.avatar = profile.photos[0]?.value;
            await user.save();
            return done(null, user);
          }
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value,
            authProvider: 'google',
          });
          await user.save();
          done(null, user);
        } catch (error) {
          console.error('Google OAuth Error:', error);
          done(error, null);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  console.log('✅ Google OAuth configured successfully');
} else {
  console.log('⚠️  Google OAuth not configured - using placeholder credentials');
  console.log('   Email/Password authentication will work normally');
  console.log('   To enable Google OAuth, add credentials to .env file');
  console.log('   See GOOGLE_OAUTH_SETUP.md for instructions');
}
module.exports = passport;