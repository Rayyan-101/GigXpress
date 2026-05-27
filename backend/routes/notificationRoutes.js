const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const notificationCtrl = require('../controllers/notificationController');

router.use(protect);

router.get('/', notificationCtrl.getMyNotifications);
router.get('/unread-count', notificationCtrl.getUnreadCount);
router.patch('/read-all', notificationCtrl.markAllAsRead);
router.patch('/:id/read', notificationCtrl.markAsRead);

module.exports = router;
