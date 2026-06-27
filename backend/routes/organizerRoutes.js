const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const OrganizerProfile = require('../models/OrganizerProfile');
const { protect } = require('../middleware/auth');
const { syncExpiredJobs } = require('../utils/jobLifecycle');

const newestApplicationFirst = (a, b) => {
  const bTime = new Date(b.appliedAt || b.createdAt || 0).getTime();
  const aTime = new Date(a.appliedAt || a.createdAt || 0).getTime();
  return bTime - aTime;
};


// ✅ ORGANIZER PROFILE
router.get('/profile', protect, async (req, res) => {
  try {
    console.log("User ID:", req.user._id);

    const user = await User.findById(req.user._id);

    const profile = await OrganizerProfile.findOne({
      userId: req.user._id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Organizer profile not found.'
      });
    }

    // Total jobs
    const totalJobsPosted = await Job.countDocuments({
      organizerId: req.user._id
    });

    // Active jobs
    const activeJobs = await Job.countDocuments({
      organizerId: req.user._id,
      status: 'Active'
    });

    // Completed jobs
    const completedJobs = await Job.countDocuments({
      organizerId: req.user._id,
      status: 'Completed'
    });

    // Find organizer jobs
    const jobs = await Job.find({
      organizerId: req.user._id
    }).select('_id');

    // Total hires
    const totalHires = await Application.countDocuments({
      jobId: {
        $in: jobs.map(job => job._id)
      },
      status: {
        $in: ['Accepted', 'Completed']
      }
    });

    // Update statistics dynamically
    profile.statistics.totalJobsPosted = totalJobsPosted;
    profile.statistics.activeJobs = activeJobs;
    profile.statistics.completedJobs = completedJobs;
    profile.statistics.totalHires = totalHires;

    await profile.save();

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});



// ✅ DASHBOARD
router.get('/dashboard', protect, async (req, res) => {
  try {
    await syncExpiredJobs({ organizerId: req.user._id });

    const jobs = await Job.find({ organizerId: req.user._id });

    const activeJobs = jobs.filter(job => job.status === 'Active').length;
    const totalJobsPosted = jobs.length;

    const applications = await Application.find({
      jobId: { $in: jobs.map(j => j._id) }
    })
      .populate('workerId', 'fullName profilePicture email')
      .populate('jobId', 'title location date time status applicantCount slotsFilled slotsTotal pay requiredSkills urgent')
      .sort({ appliedAt: -1 }); // or createdAt: -1

    const workerIds = applications.map(a => a.workerId?._id).filter(Boolean);
    const profiles = await WorkerProfile.find({ userId: { $in: workerIds } });
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[String(profile.userId)] = profile;
    });

    const recentApplications = applications
      .filter(a => a.status === 'Pending')
      .map(app => ({
        ...app.toObject(),
        workerProfile: profileMap[String(app.workerId?._id)] || null
      }))
      .sort(newestApplicationFirst)
      .slice(0, 5);


    const totalHires = applications.filter(
      app => app.status === 'Accepted' || app.status === 'Completed'
    ).length;

    res.json({
      success: true,
      data: {
        stats: {
          activeJobs,
          totalJobsPosted,
          totalHires,
          escrowBalance: 0
        },
        recentApplications,
        pendingApplicationsCount: recentApplications.length
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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
