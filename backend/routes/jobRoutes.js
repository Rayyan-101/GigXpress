const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');


// ✅ CREATE JOB
router.post('/', protect, async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const job = await Job.create({
      ...req.body,
      organizerId: req.user._id
    });

    res.json({ success: true, data: { job } });

  } catch (error) {
    console.error("CREATE JOB ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;

    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    // Optional: only active jobs
    // query.status = 'open';

    const jobs = await Job.find(query)
      .populate('organizerId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: { jobs }
    });

  } catch (error) {
    console.error("GET JOBS ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

// ✅ GET MY JOBS
router.get('/my', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ organizerId: req.user._id });

    res.json({ success: true, data: { jobs } });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ✅ UPDATE JOB
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // ✅ Ensure owner
    if (job.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: { job: updatedJob } });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ✅ DELETE JOB
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // ✅ Ensure owner
    if (job.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;