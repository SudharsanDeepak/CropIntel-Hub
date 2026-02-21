const mongoose = require('mongoose');
const alertSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false, 
  },
  product: {
    type: String,
    required: true,
  },
  targetPrice: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    enum: ['below', 'above'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'triggered'],
    default: 'active',
  },
  notifyOnce: {
    type: Boolean,
    default: false,
  },
  triggered: {
    type: Boolean,
    default: false,
  },
  lastTriggeredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
alertSchema.pre('save', function() {
  this.updatedAt = Date.now();
});
module.exports = mongoose.model('Alert', alertSchema);