const express = require('express');
const router  = express.Router();

const { protect, authorize } = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');

// 🔒 Only admin access
router.use(protect, authorize('admin'));

// ─── Dashboard & Analytics ─────────────────────
router.get('/dashboard', adminCtrl.getDashboard);
router.get('/analytics', adminCtrl.getAnalytics);

// ─── User Management ───────────────────────────
router.get('/users',              adminCtrl.getAllUsers);
router.get('/users/:id',          adminCtrl.getUserById);
router.patch('/users/:id/status', adminCtrl.toggleUserStatus);
router.patch('/users/:id/kyc',    adminCtrl.updateKyc);

// ─── Job Management ────────────────────────────
router.get('/jobs',              adminCtrl.getAllJobs);
router.patch('/jobs/:id/status', adminCtrl.updateJobStatus);
router.delete('/jobs/:id',       adminCtrl.deleteJob);

module.exports = router;