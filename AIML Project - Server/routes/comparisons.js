const express = require('express');
const router = express.Router();
const Comparison = require('../models/Comparison');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all comparison routes
router.use(authenticate);

// Get user's saved comparisons
router.get('/', async (req, res) => {
  try {
    const comparisons = await Comparison.find({ 
      userId: req.userId 
    }).sort({ updatedAt: -1 });
    
    res.json(comparisons);
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
});

// Get a specific comparison
router.get('/:id', async (req, res) => {
  try {
    const comparison = await Comparison.findOne({
      _id: req.params.id,
      userId: req.userId // Only allow access to own comparisons
    });
    
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }
    
    res.json(comparison);
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

// Create a new comparison
router.post('/', async (req, res) => {
  try {
    const { name, products } = req.body;
    
    if (!name || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Name and products array are required' });
    }
    
    if (products.length > 4) {
      return res.status(400).json({ error: 'Maximum 4 products can be compared' });
    }
    
    const comparison = new Comparison({
      userId: req.userId,
      email: req.userEmail,
      name,
      products
    });
    
    await comparison.save();
    console.log(`✅ Comparison created: ${name} for ${req.userEmail}`);
    
    res.status(201).json(comparison);
  } catch (error) {
    console.error('Error creating comparison:', error);
    res.status(500).json({ error: 'Failed to create comparison' });
  }
});

// Update a comparison
router.put('/:id', async (req, res) => {
  try {
    const { name, products } = req.body;
    
    // First check if comparison belongs to user
    const existingComparison = await Comparison.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!existingComparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (products) {
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Products must be a non-empty array' });
      }
      if (products.length > 4) {
        return res.status(400).json({ error: 'Maximum 4 products can be compared' });
      }
      updateData.products = products;
    }
    updateData.updatedAt = Date.now();
    
    const comparison = await Comparison.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    
    console.log(`✅ Comparison updated: ${comparison._id}`);
    res.json(comparison);
  } catch (error) {
    console.error('Error updating comparison:', error);
    res.status(500).json({ error: 'Failed to update comparison' });
  }
});

// Delete a comparison
router.delete('/:id', async (req, res) => {
  try {
    const comparison = await Comparison.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId // Only allow deleting own comparisons
    });
    
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }
    
    console.log(`✅ Comparison deleted: ${comparison._id}`);
    res.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    res.status(500).json({ error: 'Failed to delete comparison' });
  }
});

module.exports = router;
