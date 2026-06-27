const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const payCtrl  = require('../controllers/paymentController');

// ── Organizer: create Razorpay order when clicking Hire ──────────────────────
router.post('/create-order',
  protect, authorize('organizer'),
  payCtrl.createOrder
);

// ── Organizer: verify payment after Razorpay success callback ────────────────
router.post('/verify',
  protect, authorize('organizer'),
  payCtrl.verifyPayment
);

// ── Organizer: release escrowed funds to worker wallet ───────────────────────
router.post('/release/:paymentId',
  protect, authorize('organizer'),
  payCtrl.releasePayment
);

router.post(
  '/refund/:paymentId',
  protect,
  authorize('organizer'),
  payCtrl.refundPayment
);

// ── Organizer: view their payments ───────────────────────────────────────────
router.get('/organizer',
  protect, authorize('organizer'),
  payCtrl.getOrganizerPayments
);

// ── Worker: view their earnings + wallet ─────────────────────────────────────
router.get('/worker',
  protect, authorize('worker'),
  payCtrl.getWorkerPayments
);

// Worker withdraw request
router.post(
  '/withdraw',
  protect,
  authorize('worker'),
  payCtrl.withdraw
);

// ── Any role: payment history (role-based) ────────────────────────────────────
router.get('/history',
  protect,
  payCtrl.getPaymentHistory
);

// ── Admin: payment analytics ──────────────────────────────────────────────────
router.get('/admin/analytics',
  protect, authorize('admin'),
  payCtrl.getAdminAnalytics
);

module.exports = router;