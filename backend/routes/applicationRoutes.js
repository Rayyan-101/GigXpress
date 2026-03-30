const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// ✅ GET MY APPLICATIONS (worker)
router.get('/my', protect, async (req, res) => {
  try {
    const applications = await Application.find({ workerId: req.user._id })
      .populate({
        path: 'jobId',
        populate: {
          path: 'organizerId',
          select: 'fullName'
        }
      })
      .sort({ createdAt: -1 });

      res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    console.error("GET MY APPLICATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// ✅ APPLY TO JOB (FINAL VERSION)
router.post('/:jobId', protect, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverNote } = req.body;

    // 🔍 Check if application already exists (ANY status)
    let application = await Application.findOne({
      jobId,
      workerId: req.user._id
    });

    // ✅ CASE 1: Application exists
    if (application) {

      // 🔁 If previously withdrawn → REUSE
      if (application.status === 'Withdrawn') {
        application.status = 'Pending';
        application.coverNote = coverNote;
        await application.save();

        return res.json({
          success: true,
          data: application
        });
      }

      // ❌ Already applied (Pending / Accepted / Rejected)
      return res.status(400).json({
        success: false,
        message: 'Already applied'
      });
    }

    // 🔍 Check job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // 🔒 Prevent applying to own job (recommended)
    if (job.organizerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own job'
      });
    }

    // 🔒 Prevent applying if job is full (optional but good)
    if (job.slotsFilled >= job.slotsTotal) {
      return res.status(400).json({
        success: false,
        message: 'No slots available'
      });
    }

    // ✅ CASE 2: Create new application
    application = await Application.create({
      jobId,
      workerId: req.user._id,
      organizerId: job.organizerId,
      coverNote,
      status: 'Pending'
    });

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error("APPLY ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to apply'
    });
  }
});

// ✅ WITHDRAW APPLICATION
router.patch('/:id/withdraw', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // only worker can withdraw
    if (application.workerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    application.status = 'Withdrawn';
    await application.save();

    res.json({ success: true });

  } catch (error) {
    console.error("WITHDRAW ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw'
    });
  }
});

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