const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Withdrawal amount must be at least ₹1"],
    },

   status: {
  type: String,
  enum: ["Completed", "Failed"],
  default: "Completed",
  index: true,
},

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    processedAt: {
      type: Date,
      default: null,
    },
    method: {
  type: String,
  enum: ["UPI", "Bank"],
  required: true,
},

upiId: {
  type: String,
  default: null,
},

accountNumber: {
  type: String,
  default: null,
},

ifsc: {
  type: String,
  default: null,
},

accountHolder: {
  type: String,
  default: null,
},

transactionId: {
  type: String,
  default: null,
},

completedAt: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

// Useful indexes
withdrawalRequestSchema.index({ workerId: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model(
  "WithdrawalRequest",
  withdrawalRequestSchema
);