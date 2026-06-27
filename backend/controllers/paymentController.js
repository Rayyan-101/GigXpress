const crypto      = require('crypto');
const razorpay    = require('../config/razorpay');
const Payment     = require('../models/Payment');
const Wallet      = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Application = require('../models/Application');
const Job         = require('../models/Job');
const User        = require('../models/User');
const { createConversationForApplication } = require('./chatController');

// ─── Helper: get or create wallet ────────────────────────────────────────────
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) wallet = await Wallet.create({ userId });
  return wallet;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/create-order
// Called when organizer clicks "Hire" — creates a Razorpay order before payment
// ─────────────────────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'applicationId is required.' });
    }

    // Load application and verify organizer ownership
    const application = await Application.findOne({
      _id:         applicationId,
      organizerId: req.user._id,
      status:      'Pending',
    }).populate('jobId', 'title pay slotsTotal slotsFilled');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found, not pending, or you are not the organizer.',
      });
    }

    const job = application.jobId;
    if (!job) return res.status(404).json({ success: false, message: 'Associated job not found.' });

    // Check slots still available
    if (job.slotsFilled >= job.slotsTotal) {
      return res.status(400).json({ success: false, message: 'All slots are already filled.' });
    }

    // Prevent duplicate payment creation
    const existingPayment = await Payment.findOne({ applicationId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: `A payment already exists for this application (${existingPayment.status}).`,
      });
    }

    const amountInPaise = Math.round(job.pay.amount * 100); // Razorpay works in paise

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `gig_${applicationId}`,
      notes: {
        applicationId: String(applicationId),
        jobId:         String(job._id),
        jobTitle:      job.title,
        organizerId:   String(req.user._id),
        workerId:      String(application.workerId),
      },
    });
    console.log("Razorpay Order:", razorpayOrder);

    res.json({
      success: true,
      message: 'Razorpay order created.',
      data: {
        orderId:    razorpayOrder.id,
        amount:     amountInPaise,
        currency:   'INR',
        keyId:      process.env.RAZORPAY_KEY_ID,
        jobTitle:   job.title,
        amountINR:  job.pay.amount,
        applicationId,
      },
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/verify
// Called after Razorpay payment succeeds on the frontend
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      applicationId,
    } = req.body;

    // ── 1. Verify Razorpay signature ─────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // ── 2. Prevent duplicate processing ──────────────────────────────────────
    const duplicate = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Payment already processed.' });
    }

    // ── 3. Load application ───────────────────────────────────────────────────
    const application = await Application.findOne({
      _id:         applicationId,
      organizerId: req.user._id,
      status:      'Pending',
    }).populate('jobId', 'title pay');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const job = application.jobId;

    // ── 4. Create Payment record (Escrowed) ──────────────────────────────────
    const payment = await Payment.create({
      jobId:             job._id,
      applicationId:     application._id,
      organizerId:       req.user._id,
      workerId:          application.workerId,
      amount:            job.pay.amount,
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status:            'Escrowed',
      escrowedAt:        new Date(),
    });

    // ── 5. Update application status to Accepted ──────────────────────────────
    application.status      = 'Accepted';
    application.respondedAt = new Date();
    await application.save();

    // ── 6. Update job slots ───────────────────────────────────────────────────
    // Increase filled slots
    const updatedJob = await Job.findByIdAndUpdate(
      job._id,
      {
        $inc: { slotsFilled: 1 }
      },
      {
        new: true
      }
    );

    // If all slots are filled, pause the job
    if (updatedJob.slotsFilled >= updatedJob.slotsTotal) {
      updatedJob.status = "Paused";
      await updatedJob.save();
    }

    // ── 7. Auto-create chat conversation ─────────────────────────────────────
    await createConversationForApplication(application);

    res.json({
      success: true,
      message: 'Payment verified and escrowed successfully!',
      data: { payment, application },
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/release/:paymentId
// Organizer releases escrowed funds to worker's wallet
// ─────────────────────────────────────────────────────────────────────────────
exports.releasePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id:         req.params.paymentId,
      organizerId: req.user._id,
      status:      'Escrowed',
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found, not escrowed, or you are not the organizer.',
      });
    }

    // Verify application is Accepted or Completed
    const application = await Application.findById(payment.applicationId)
      .populate('jobId', 'date title');

    if (!application || application.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be released after the gig is completed.',
      });
    }

    // ── Update payment status ─────────────────────────────────────────────────
    payment.status     = 'Released';
    payment.releasedAt = new Date();
    await payment.save();

    // ── Credit worker wallet ──────────────────────────────────────────────────
    const wallet = await getOrCreateWallet(payment.workerId);

    wallet.balance       += payment.amount;
    wallet.totalEarned   += payment.amount;
    wallet.totalReleased += payment.amount;
    await wallet.save();

    // ── Create wallet transaction ─────────────────────────────────────────────
    await WalletTransaction.create({
      walletId:     wallet._id,
      userId:       payment.workerId,
      paymentId:    payment._id,
      amount:       payment.amount,
      type:         'Credit',
      description:  `Payment released for: ${application.jobId?.title || 'Gig'}`,
      balanceAfter: wallet.balance,
    });

    res.json({
      success: true,
      message: 'Payment released to worker wallet successfully!',
      data: {
        payment,
        workerBalance: wallet.balance,
      },
    });
  } catch (error) {
    console.error('releasePayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/refund/:paymentId
// Refund an escrowed payment
// ─────────────────────────────────────────────────────────────────────────────
exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      organizerId: req.user._id,
      status: 'Escrowed',
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Escrowed payment not found.',
      });
    }

    try {
      await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: payment.amount * 100, // in paise
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Razorpay refund failed.",
        error: err.message,
      });
    }

    // Update payment status
    payment.status = 'Refunded';
    payment.refundedAt = new Date();
    await payment.save();

    // Update application status
    const application = await Application.findById(payment.applicationId);

    if (application) {
      application.status = 'Cancelled';
      await application.save();
    }

    const job = await Job.findById(payment.jobId);

if (job) {
  job.slotsFilled = Math.max(0, job.slotsFilled - 1);

  if (job.status === 'Paused' && job.slotsFilled < job.slotsTotal) {
    job.status = 'Active';
  }

  await job.save();
}

    res.json({
      success: true,
      message: 'Payment refunded successfully.',
      data: { payment },
    });

  } catch (error) {
    console.error('refundPayment error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/organizer
// All payments made by this organizer
// ─────────────────────────────────────────────────────────────────────────────
exports.getOrganizerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ organizerId: req.user._id })
      .populate('workerId',      'fullName email phone profilePicture')
      .populate('jobId',         'title date location pay')
      .populate('applicationId', 'status coverNote')
      .sort({ createdAt: -1 });

    // Summary stats
    const stats = {
      totalEscrowed: payments.filter(p => p.status === 'Escrowed').reduce((s, p) => s + p.amount, 0),
      totalReleased: payments.filter(p => p.status === 'Released').reduce((s, p) => s + p.amount, 0),
      totalPending:  payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0),
      countEscrowed: payments.filter(p => p.status === 'Escrowed').length,
      countReleased: payments.filter(p => p.status === 'Released').length,
    };

    res.json({ success: true, data: { payments, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/worker
// All payments for this worker (their earnings)
// ─────────────────────────────────────────────────────────────────────────────
exports.getWorkerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ workerId: req.user._id })
      .populate('organizerId', 'fullName email profilePicture')
      .populate('jobId',       'title date location pay')
      .sort({ createdAt: -1 });

    // Wallet
    const wallet = await Wallet.findOne({ userId: req.user._id });

    // Transactions
    const transactions = wallet
      ? await WalletTransaction.find({ userId: req.user._id })
          .populate('paymentId', 'amount status')
          .sort({ createdAt: -1 })
          .limit(50)
      : [];

    res.json({
      success: true,
      data: {
        payments,
        wallet: wallet
  ? {
      ...wallet.toObject(),
      availableBalance:
        wallet.balance - wallet.pendingWithdrawal,
    }
  : {
      balance: 0,
      pendingWithdrawal: 0,
      availableBalance: 0,
      totalEarned: 0,
      totalReleased: 0,
    },
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/history  (alias — returns based on role)
// ─────────────────────────────────────────────────────────────────────────────
exports.getPaymentHistory = async (req, res) => {
  if (req.user.role === 'organizer') return exports.getOrganizerPayments(req, res);
  return exports.getWorkerPayments(req, res);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/admin/analytics  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAdminAnalytics = async (req, res) => {
  try {
    const [allPayments, totalUsers, totalWalletBalance] = await Promise.all([
      Payment.find({}).lean(),
      User.countDocuments({ role: { $in: ['organizer', 'worker'] } }),
      Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
    ]);

    const stats = {
      totalTransactions:    allPayments.length,
      totalEscrowAmount:    allPayments.filter(p => p.status === 'Escrowed').reduce((s, p) => s + p.amount, 0),
      totalReleasedAmount:  allPayments.filter(p => p.status === 'Released').reduce((s, p) => s + p.amount, 0),
      totalFailedAmount:    allPayments.filter(p => p.status === 'Failed').reduce((s, p) => s + p.amount, 0),
      activeEscrows:        allPayments.filter(p => p.status === 'Escrowed').length,
      completedReleases:    allPayments.filter(p => p.status === 'Released').length,
      platformVolume:       allPayments.filter(p => ['Escrowed','Released'].includes(p.status)).reduce((s, p) => s + p.amount, 0),
      totalWalletBalance:   totalWalletBalance[0]?.total || 0,
      totalUsers,
    };

    // Recent 20 payments with details
    const recentPayments = await Payment.find({})
      .populate('organizerId', 'fullName email')
      .populate('workerId',    'fullName email')
      .populate('jobId',       'title date')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: { stats, recentPayments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/withdraw
// Worker requests withdrawal from wallet
// ─────────────────────────────────────────────────────────────────────────────
exports.withdraw = async (req, res) => {
  try {
    const {
      amount,
      method,
      upiId,
      accountHolder,
      accountNumber,
      ifsc,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid withdrawal amount.",
      });
    }

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal method is required.",
      });
    }

    if (method === "UPI" && !upiId) {
      return res.status(400).json({
        success: false,
        message: "UPI ID is required.",
      });
    }

    if (
      method === "Bank" &&
      (!accountHolder || !accountNumber || !ifsc)
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete bank details are required.",
      });
    }

    const wallet = await Wallet.findOne({
      userId: req.user._id,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found.",
      });
    }

    const availableBalance =
      wallet.balance - wallet.pendingWithdrawal;

    if (availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance.",
      });
    }

    // Simulate instant payout
    wallet.balance -= amount;

    await wallet.save();

    const transactionId = "SIM_" + Date.now();

    const withdrawal = await WithdrawalRequest.create({
      workerId: req.user._id,
      walletId: wallet._id,
      amount,

      method,

      upiId: method === "UPI" ? upiId : null,

      accountHolder:
        method === "Bank"
          ? accountHolder
          : null,

      accountNumber:
        method === "Bank"
          ? accountNumber
          : null,

      ifsc:
        method === "Bank"
          ? ifsc
          : null,

      transactionId,

      status: "Completed",

      completedAt: new Date(),
    });

    await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.user._id,
      paymentId: null,
      amount,
      type: "Debit",
      description: `Withdrawal via ${method}`,
      balanceAfter: wallet.balance,
    });

    res.json({
      success: true,
      message: "Withdrawal successful.",
      transactionId,

      data: {
        withdrawal,
        wallet: {
          ...wallet.toObject(),
          availableBalance:
            wallet.balance -
            wallet.pendingWithdrawal,
        },
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};