require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Paste Schema and Model
 * Represents a paste in the application
 */
const pasteSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    minlength: 1
  },
  created_at: {
    type: Number,
    required: true,
    default: () => Date.now()
  },
  expires_at: {
    type: Number,
    default: null
  },
  remaining_views: {
    type: Number,
    default: null
  }
}, { _id: false });

/**
 * Check if paste has expired based on TTL
 */
pasteSchema.methods.isExpiredByTime = function(currentTimeMs) {
  if (this.expires_at === null) {
    return false;
  }
  return currentTimeMs >= this.expires_at;
};

/**
 * Check if paste has exceeded view limit
 */
pasteSchema.methods.isExpiredByViews = function() {
  if (this.remaining_views === null) {
    return false;
  }
  return this.remaining_views <= 0;
};

/**
 * Check overall expiry status
 */
pasteSchema.methods.isExpired = function(currentTimeMs) {
  return this.isExpiredByTime(currentTimeMs) || this.isExpiredByViews();
};

/**
 * Decrement remaining views atomically
 */
pasteSchema.statics.decrementViews = async function(id) {
  const paste = await this.findById(id);
  if (!paste || paste.remaining_views === null) {
    return null;
  }

  if (paste.remaining_views <= 0) {
    return null;
  }

  return await this.findByIdAndUpdate(
    id,
    { $inc: { remaining_views: -1 } },
    { new: true }
  );
};

module.exports = mongoose.model('Paste', pasteSchema);
