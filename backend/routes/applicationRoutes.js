const express = require('express');
const router = express.Router();

const Application = require('../models/Application');
const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const OrganizerProfile = require('../models/OrganizerProfile');
const User = require('../models/User');
const appCtrl = require('../controllers/applicationController');
const { createNotification } = require('../services/notificationService');

const { protect, authorize } = require('../middleware/auth');


// ─────────────────────────────────────────────
// ✅ ACCEPT / REJECT APPLICATION
// ─────────────────────────────────────────────

router.patch('/:id/rate-organizer',   protect, authorize('worker'),    appCtrl.rateOrganizer);

router.patch('/:id/respond', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      organizerId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be updated.'
      });
    }

    application.status = status;
    application.respondedAt = new Date();
    await application.save();

    if (status === 'Accepted') {
      await Job.findByIdAndUpdate(application.jobId, {
        $inc: { slotsFilled: 1 }
      });

      await OrganizerProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { 'statistics.totalHires': 1 } }
      );
    }

    const job = await Job.findById(application.jobId).select('title');
    await createNotification({
      io: req.app.get('io'),
      recipientId: application.workerId,
      actorId: req.user._id,
      type: 'application_status',
      title: `Application ${status.toLowerCase()}`,
      message: `Your application for "${job?.title || 'a gig'}" was ${status.toLowerCase()}.`,
      link: '/volunteer',
      metadata: { jobId: application.jobId, applicationId: application._id }
    });

    res.json({
      success: true,
      message: `Application ${status.toLowerCase()}`,
      data: { application }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});



// ─────────────────────────────────────────────
// ✅ APPLY TO JOB (Advanced + Reapply Feature)
// ─────────────────────────────────────────────
router.post('/:jobId', protect, async (req, res) => {
  try {
    const { coverNote } = req.body;
    const { jobId } = req.params;

    // 🔒 KYC Check
    const worker = await User.findById(req.user._id).select('kycStatus');
    if (!worker || worker.kycStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        kycRequired: true,
        kycStatus: worker?.kycStatus || 'pending',
        message: 'KYC verification required before applying.'
      });
    }

    // 🔍 Job Check
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Job not accepting applications.'
      });
    }

    if (job.slotsFilled >= job.slotsTotal) {
      return res.status(400).json({
        success: false,
        message: 'All slots are filled.'
      });
    }

    // ❌ Prevent applying to own job
    if (String(job.organizerId) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own job.'
      });
    }

    // 🔍 Check existing application
    let application = await Application.findOne({
      jobId,
      workerId: req.user._id,
    });

    // 🔁 REAPPLY FEATURE
    if (application) {

      // ✅ If withdrawn → reuse
      if (application.status === 'Withdrawn') {
        application.status = 'Pending';
        application.coverNote = coverNote || '';
        application.appliedAt = new Date();

        await application.save();

        await createNotification({
          io: req.app.get('io'),
          recipientId: job.organizerId,
          actorId: req.user._id,
          type: 'new_application',
          title: 'Application submitted again',
          message: `${req.user.fullName} reapplied for "${job.title}".`,
          link: '/organizer',
          metadata: { jobId: job._id, applicationId: application._id }
        });

        return res.json({
          success: true,
          message: 'Reapplied successfully!',
          data: { application }
        });
      }

      // ❌ Already applied
      return res.status(400).json({
        success: false,
        message: 'You have already applied.'
      });
    }

    // ✅ Create new application
    application = await Application.create({
      jobId: job._id,
      workerId: req.user._id,
      organizerId: job.organizerId,
      coverNote: coverNote || ''
    });

    // 📊 Update stats
    await Promise.all([
      Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } }),
      WorkerProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { 'statistics.totalGigsApplied': 1 } }
      )
    ]);

    await createNotification({
      io: req.app.get('io'),
      recipientId: job.organizerId,
      actorId: req.user._id,
      type: 'new_application',
      title: 'New application received',
      message: `${req.user.fullName} applied for "${job.title}".`,
      link: '/organizer',
      metadata: { jobId: job._id, applicationId: application._id }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted!',
      data: { application }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Already applied.'
      });
    }

    console.error('APPLY ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// ✅ GET MY APPLICATIONS
// ─────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const applications = await Application.find({
      workerId: req.user._id
    })
      .populate('jobId', 'title date time location pay status urgent')
      .populate('organizerId', 'fullName profilePicture')
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: { applications } });

  } catch (error) {
    console.error("GET MY APPLICATIONS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// ✅ GET APPLICATIONS FOR A JOB (Organizer)
// ─────────────────────────────────────────────
router.get('/job/:jobId', protect, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      organizerId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const applications = await Application.find({ jobId: job._id })
      .populate('workerId', 'fullName email phone profilePicture')
      .sort({ appliedAt: -1 });

    // 🔥 Enrich with worker profile
    const workerIds = applications.map(a => a.workerId?._id).filter(Boolean);
    const profiles = await WorkerProfile.find({ userId: { $in: workerIds } });

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[String(p.userId)] = p;
    });

    const enriched = applications.map(app => ({
      ...app.toObject(),
      workerProfile: profileMap[String(app.workerId?._id)] || null
    }));

    res.json({
      success: true,
      data: { applications: enriched, job }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// ─────────────────────────────────────────────
// ✅ WITHDRAW APPLICATION (with count fix)
// ─────────────────────────────────────────────
router.patch('/:id/withdraw', protect, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      workerId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    if (application.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be withdrawn.'
      });
    }

    application.status = 'Withdrawn';
    await application.save();

    await Job.findByIdAndUpdate(application.jobId, {
      $inc: { applicantCount: -1 }
    });

    res.json({
      success: true,
      message: 'Application withdrawn.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// ✅ COMPLETE + RATE WORKER
// ─────────────────────────────────────────────
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    console.log('Hi');
    const { score, review } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      organizerId: req.user._id,
      status: { $in: ['Accepted', 'Completed'] }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    application.status = 'Completed';
    application.rating = {
      score,
      review,
      ratedAt: new Date()
    };

    await application.save();

    // ⭐ Calculate avg rating
    const allRatings = await Application.find({
      workerId: application.workerId,
      'rating.score': { $ne: null }
    });

    const total = allRatings.reduce(
  (sum, a) => sum + (a.rating?.score || 0),
  0
);

const avgRating = allRatings.length > 0
  ? total / allRatings.length
  : 0;

    await WorkerProfile.findOneAndUpdate(
      { userId: application.workerId },
      {
        $inc: { 'statistics.totalGigsCompleted': 1 },
        'ratings.average': Math.round(avgRating * 10) / 10,
        'ratings.total': allRatings.length
      }
    );

    await OrganizerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { 'statistics.completedJobs': 1 } }
    );

    res.json({
      success: true,
      message: 'Job completed & rated.',
      data: { application }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
