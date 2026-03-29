const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },

  location: {
    city: { type: String, required: true }
  },

  date: { type: Date, required: true },

  time: { type: String, required: true },

  slotsTotal: { type: Number, required: true, min: 1 },

  slotsFilled: { type: Number, default: 0 },

  pay: {
    amount: { type: Number, required: true },
    type: { type: String, enum: ['fixed', 'hourly'], required: true }
  },

  category: { type: String, required: true },

  requiredSkills: [{ type: String }],

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