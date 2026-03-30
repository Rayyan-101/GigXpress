const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const workerCtrl = require('../controllers/workerController');

router.use(protect, authorize('worker'));

router.get('/dashboard', workerCtrl.getDashboard);
router.get('/profile',   workerCtrl.getProfile);
router.put('/profile',   workerCtrl.updateProfile);

module.exports = router;