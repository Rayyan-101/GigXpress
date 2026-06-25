const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },

  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },

  location: {
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: '' }
  },

  date: { type: Date, required: true },

  time: { type: String, required: true },

  duration: { type: String, trim: true, default: 'Full Day' },

  slotsTotal: { type: Number, required: true, min: 1 },

  slotsFilled: { type: Number, default: 0, min: 0 },

  applicantCount: { type: Number, default: 0, min: 0 },

  pay: {
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['fixed', 'per_day', 'per_hour', 'hourly'],
      required: true,
      default: 'fixed'
    }
  },

  category: { type: String, required: true, trim: true },

  requiredSkills: [{ type: String, trim: true }],

  requirements: {
    type: String,
    trim: true,
    maxlength: [1000, 'Requirements cannot exceed 1000 characters'],
    default: ''
  },

  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['Active', 'Paused', 'Completed'],
    default: 'Active'
  },

  urgent: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
