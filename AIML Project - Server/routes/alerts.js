const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
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
    const { product, targetPrice, condition, email, notifyOnce } = req.body;
    if (!product || !targetPrice || !condition || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (targetPrice <= 0) {
      return res.status(400).json({ error: 'Target price must be greater than 0' });
    }
    if (!['below', 'above'].includes(condition)) {
      return res.status(400).json({ error: 'Condition must be "below" or "above"' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    const alert = new Alert({
      product,
      targetPrice,
      condition,
      email,
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
    const { product, targetPrice, condition, email, notifyOnce, status } = req.body;
    const updateData = {};
    if (product) updateData.product = product;
    if (targetPrice) updateData.targetPrice = targetPrice;
    if (condition) updateData.condition = condition;
    if (email) updateData.email = email;
    if (notifyOnce !== undefined) updateData.notifyOnce = notifyOnce;
    if (status) updateData.status = status;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    console.log(`✅ Alert updated: ${alert._id}`);
    res.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
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
    const alert = await Alert.findById(req.params.id);
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
    const alert = await Alert.findById(req.params.id);
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