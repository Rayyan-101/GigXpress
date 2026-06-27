const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true, // one payment per application
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least ₹1'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    // Razorpay fields
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Escrowed', 'Released', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    escrowedAt:  { type: Date, default: null },
    releasedAt:  { type: Date, default: null },
    refundedAt:  { type: Date, default: null },
    notes:       { type: String, default: '' },
  },
  { timestamps: true }
);

paymentSchema.index({ organizerId: 1, status: 1 });
paymentSchema.index({ workerId: 1, status: 1 });
paymentSchema.index({ jobId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);