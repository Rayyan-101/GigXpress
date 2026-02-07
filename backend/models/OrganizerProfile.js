const mongoose = require('mongoose');

const organizerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    organizationType: {
      type: String,
      enum: ['company', 'individual', 'ngo', 'educational'],
      required: true
    },
    gstNumber: {
      type: String,
      trim: true,
      default: null,
      match: [/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GST format']
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      fullAddress: { type: String, required: true }
    },
    escrowBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    statistics: {
      totalJobsPosted: { type: Number, default: 0 },
      activeJobs: { type: Number, default: 0 },
      completedJobs: { type: Number, default: 0 },
      totalAmountSpent: { type: Number, default: 0 },
      totalHires: { type: Number, default: 0 }
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      total: { type: Number, default: 0 }
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('OrganizerProfile', organizerProfileSchema);