const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// GET applications by job
router.get('/job/:jobId', protect, async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('workerId', 'fullName rating skills');

    res.json({ success: true, data: { applications } });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ACCEPT / REJECT
router.patch('/:id/respond', protect, async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ Validate status
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const job = await Job.findById(application.jobId);

    // ✅ Ensure only organizer can respond
    if (job.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    application.status = status;
    await application.save();

    // ✅ Increment slots only if accepted
    if (status === 'Accepted') {
      await Job.findByIdAndUpdate(application.jobId, {
        $inc: { slotsFilled: 1 }
      });
    }

    res.json({ success: true, data: application });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;