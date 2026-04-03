const express   = require('express');
const router    = express.Router();
const { protect, authorize } = require('../middleware/auth');
const kycCtrl   = require('../controllers/kycController');

// User routes (organizer or worker)
router.post('/submit',protect,kycCtrl.submitKyc);
router.get('/my',protect,kycCtrl.getMyKyc);

// Admin routes
router.get('/admin/all',protect, authorize('admin'), kycCtrl.getAllSubmissions);
router.get('/admin/:id',protect, authorize('admin'), kycCtrl.getSubmissionById);
router.patch('/admin/:id/review', protect, authorize('admin'), kycCtrl.reviewSubmission);

module.exports = router;