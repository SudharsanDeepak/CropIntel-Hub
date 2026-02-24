const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { authenticate } = require('../middleware/auth');
const { triggerManualCheck, getMonitoringStats } = require('../services/priceMonitor');

// Apply authentication middleware to all alert routes
router.use(authenticate);

// Get monitoring statistics
router.get('/monitoring/stats', async (req, res) => {
  try {
    const stats = getMonitoringStats();
    
    // Get user-specific alert counts
    const activeAlerts = await Alert.countDocuments({ 
      email: req.userEmail, 
      status: 'active', 
      triggered: false 
    });
    const triggeredAlerts = await Alert.countDocuments({ 
      email: req.userEmail, 
      triggered: true 
    });
    const pausedAlerts = await Alert.countDocuments({ 
      email: req.userEmail, 
      status: 'paused' 
    });
    
    res.json({
      monitoring: stats,
      alerts: {
        active: activeAlerts,
        triggered: triggeredAlerts,
        paused: pausedAlerts,
        total: activeAlerts + triggeredAlerts + pausedAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring stats' });
  }
});

// Trigger manual check (admin only - checks all alerts)
router.post('/monitoring/check', async (req, res) => {
  try {
    const result = await triggerManualCheck();
    res.json({
      success: true,
      message: 'Manual check completed',
      result
    });
  } catch (error) {
    console.error('Error triggering manual check:', error);
    res.status(500).json({ error: 'Failed to trigger manual check' });
  }
});

// Get user's alerts only
router.get('/', async (req, res) => {
  try {
    // Only return alerts for the authenticated user
    const alerts = await Alert.find({ email: req.userEmail }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findOne({ 
      _id: req.params.id, 
      email: req.userEmail // Only allow access to own alerts
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product, targetPrice, condition, notifyOnce } = req.body;
    
    // Use authenticated user's email
    const email = req.userEmail;
    
    if (!product || !targetPrice || !condition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (targetPrice <= 0) {
      return res.status(400).json({ error: 'Target price must be greater than 0' });
    }
    
    if (!['below', 'above'].includes(condition)) {
      return res.status(400).json({ error: 'Condition must be "below" or "above"' });
    }
    
    const alert = new Alert({
      product,
      targetPrice,
      condition,
      email, // Use authenticated user's email
      notifyOnce: notifyOnce || false,
      status: 'active',
    });
    
    await alert.save();
    console.log(`✅ Alert created: ${product} ${condition} ₹${targetPrice} for ${email}`);
    
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { product, targetPrice, condition, notifyOnce, status } = req.body;
    
    // First check if alert belongs to user
    const existingAlert = await Alert.findOne({ 
      _id: req.params.id, 
      email: req.userEmail 
    });
    
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    const updateData = {};
    if (product) updateData.product = product;
    if (targetPrice) updateData.targetPrice = targetPrice;
    if (condition) updateData.condition = condition;
    if (notifyOnce !== undefined) updateData.notifyOnce = notifyOnce;
    if (status) updateData.status = status;
    
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    
    console.log(`✅ Alert updated: ${alert._id}`);
    res.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({ 
      _id: req.params.id, 
      email: req.userEmail // Only allow deleting own alerts
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    console.log(`✅ Alert deleted: ${alert._id}`);
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const alert = await Alert.findOne({ 
      _id: req.params.id, 
      email: req.userEmail 
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    alert.status = alert.status === 'active' ? 'paused' : 'active';
    await alert.save();
    
    console.log(`✅ Alert toggled: ${alert._id} -> ${alert.status}`);
    res.json(alert);
  } catch (error) {
    console.error('Error toggling alert:', error);
    res.status(500).json({ error: 'Failed to toggle alert' });
  }
});

router.patch('/:id/reset', async (req, res) => {
  try {
    const alert = await Alert.findOne({ 
      _id: req.params.id, 
      email: req.userEmail 
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    alert.status = 'active';
    alert.triggered = false;
    alert.lastTriggeredAt = null;
    await alert.save();
    
    console.log(`✅ Alert reset: ${alert._id}`);
    res.json(alert);
  } catch (error) {
    console.error('Error resetting alert:', error);
    res.status(500).json({ error: 'Failed to reset alert' });
  }
});
module.exports = router;