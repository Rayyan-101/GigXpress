const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },

    // Amount currently requested for withdrawal but not yet approved
    pendingWithdrawal: {
      type: Number,
      default: 0,
      min: [0, 'Pending withdrawal cannot be negative'],
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalReleased: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Wallet', walletSchema);