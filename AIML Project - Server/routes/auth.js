const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
router.post('/send-otp-signup', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }
    const otp = generateOTP();
    await OTP.deleteMany({ email, purpose: 'signup' });
    const otpDoc = new OTP({
      email,
      otp,
      purpose: 'signup',
    });
    await otpDoc.save();
    const emailResult = await sendOTPEmail(email, otp, 'signup');
    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }
    const response = {
      success: true,
      message: emailResult.devMode 
        ? `OTP: ${otp} (Email not configured - showing OTP for testing)`
        : 'OTP sent to your email. Please check your inbox.',
    };
    if (emailResult.devMode) {
      response.devMode = true;
      response.otp = otp; 
    }
    res.json(response);
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending OTP' 
    });
  }
});
router.post('/verify-otp-signup', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }
    const otpDoc = await OTP.findOne({ email, otp, purpose: 'signup' });
    if (!otpDoc) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
    });
    await user.save();
    await OTP.deleteOne({ _id: otpDoc._id });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Verify OTP Signup Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
});
router.post('/send-otp-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please sign in with Google' 
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    const otp = generateOTP();
    await OTP.deleteMany({ email, purpose: 'login' });
    const otpDoc = new OTP({
      email,
      otp,
      purpose: 'login',
    });
    await otpDoc.save();
    const emailResult = await sendOTPEmail(email, otp, 'login');
    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }
    const response = {
      success: true,
      message: emailResult.devMode 
        ? `OTP: ${otp} (Email not configured - showing OTP for testing)`
        : 'OTP sent to your email. Please check your inbox.',
    };
    if (emailResult.devMode) {
      response.devMode = true;
      response.otp = otp; 
    }
    res.json(response);
  } catch (error) {
    console.error('Send Login OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending OTP' 
    });
  }
});
router.post('/verify-otp-login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and OTP' 
      });
    }
    const otpDoc = await OTP.findOne({ email, otp, purpose: 'login' });
    if (!otpDoc) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    await OTP.deleteOne({ _id: otpDoc._id });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});
module.exports = router;