// server/models/Decision.js
// Mongoose schema for the Decision Memory system
// WHY: Structured schema ensures data consistency. Tags enable filtering by category.
// The compound index on file+function speeds up lookups for "what decisions were made for this function?"

import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema({
  file: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
  },
  function: {
    type: String,
    default: '',
    trim: true,
  },
  decision: {
    type: String,
    required: [true, 'Decision description is required'],
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
  },
  tags: {
    type: [String],
    default: [],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Compound index: common query pattern is "show me decisions for this file/function"
decisionSchema.index({ file: 1, function: 1 });

// Text index: enables full-text search across decisions and reasons
decisionSchema.index({ decision: 'text', reason: 'text' });

const Decision = mongoose.model('Decision', decisionSchema);

export default Decision;
