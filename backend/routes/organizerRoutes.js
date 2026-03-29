const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');


// ✅ DASHBOARD
router.get('/dashboard', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ organizerId: req.user._id });

    const activeJobs = jobs.filter(j => j.status === 'Active').length;
    const totalJobsPosted = jobs.length;

    const applications = await Application.find({
      jobId: { $in: jobs.map(j => j._id) }
    });

    const totalHires = applications.filter(a => a.status === 'Accepted').length;

    res.json({
      success: true,
      data: {
        stats: {
          activeJobs,
          totalJobsPosted,
          totalHires,
          escrowBalance: 0
        },
        recentApplications: applications.slice(0, 5)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ✅ HIRED WORKERS
router.get('/hired', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ organizerId: req.user._id });

    const applications = await Application.find({
      jobId: { $in: jobs.map(j => j._id) },
      status: 'Accepted'
    })
    .populate('workerId', 'fullName rating skills')
    .populate('jobId', 'title date');

    res.json({
      success: true,
      data: {
        hired: applications
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;