const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// GET CURRENT USER
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;