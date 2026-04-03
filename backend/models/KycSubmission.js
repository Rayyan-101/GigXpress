const mongoose = require('mongoose');

const kycSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true   // one active KYC record per user
    },
    role: {
      type: String,
      enum: ['organizer', 'worker'],
      required: true
    },
    // Common
    fullName:    { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    address:     { type: String, required: true },
    // Aadhaar
    aadhaarNumber: { type: String, required: true },
    aadhaarFront:  { type: String, required: true },  // base64 OR filename
    aadhaarBack:   { type: String, required: true },
    // PAN
    panNumber: { type: String, required: true },
    panFront:  { type: String, required: true },
    // Selfie
    selfie: { type: String, required: true },
    // Organizer extras
    gstCertificate: { type: String, default: null },
    // Status & review
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted'
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt:      { type: Date, default: null },
    submittedAt:     { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('KycSubmission', kycSubmissionSchema);