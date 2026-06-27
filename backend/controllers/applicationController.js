const Application = require('../models/Application');
const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const OrganizerProfile = require('../models/OrganizerProfile');
const User = require('../models/User');
const { createConversationForApplication } = require('./chatController');
const { isJobExpired } = require('../utils/jobLifecycle');


exports.applyToJob = async (req, res) => {
  try {
    const worker = await User.findById(req.user._id).select('kycStatus');
    if (!worker || worker.kycStatus !== 'verified') {
      return res.status(403).json({ success: false, kycRequired: true, kycStatus: worker?.kycStatus || 'pending', message: 'KYC verification required.' });
    }
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.status !== 'Active') return res.status(400).json({ success: false, message: 'Job is no longer accepting applications.' });
    if (job.slotsFilled >= job.slotsTotal) return res.status(400).json({ success: false, message: 'All slots are filled.' });
    const existing = await Application.findOne({ jobId: job._id, workerId: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied.' });
    if (String(job.organizerId) === String(req.user._id)) return res.status(400).json({ success: false, message: 'Cannot apply to own job.' });
    const application = await Application.create({ jobId: job._id, workerId: req.user._id, organizerId: job.organizerId, coverNote: req.body.coverNote || '' });
    await Promise.all([
      Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } }),
      WorkerProfile.findOneAndUpdate({ userId: req.user._id }, { $inc: { 'statistics.totalGigsApplied': 1 } })
    ]);
    res.status(201).json({ success: true, message: 'Application submitted!', data: { application } });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Already applied.' });
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ workerId: req.user._id })
      .populate('jobId', 'title date time location pay status duration urgent organizerId')
      .populate('organizerId', 'fullName profilePicture')
      .sort({ appliedAt: -1 });
    const orgIds = [...new Set(applications.map(a => a.organizerId?._id).filter(Boolean))];
    const orgProfiles = await OrganizerProfile.find({ userId: { $in: orgIds } });
    const orgProfileMap = {};
    orgProfiles.forEach(p => { orgProfileMap[String(p.userId)] = p; });
    const enriched = applications.map(app => ({ ...app.toObject(), organizerProfile: orgProfileMap[String(app.organizerId?._id)] || null }));
    res.json({ success: true, data: { applications: enriched } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, organizerId: req.user._id });
    // console.log(req.user);
    // console.log(organizerId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    const applications = await Application.find({ jobId: job._id })
      .populate('workerId', 'fullName email phone profilePicture')
      .sort({ appliedAt: -1 });
    const workerIds = applications.map(a => a.workerId?._id).filter(Boolean);
    const profiles = await WorkerProfile.find({ userId: { $in: workerIds } });
    const profileMap = {};
    profiles.forEach(p => { profileMap[String(p.userId)] = p; });

    // Attach payment doc to each application so frontend can show payment status + release button
    const Payment = require('../models/Payment');
    const appIds = applications.map(a => a._id);
    const payments = await Payment.find({ applicationId: { $in: appIds } });
    const paymentMap = {};
    payments.forEach(p => { paymentMap[String(p.applicationId)] = p; });
    console.log("Payment Map Keys:", Object.keys(paymentMap));
    console.log("Application IDs:", applications.map(a => String(a._id)));


    const enriched = applications.map(app => ({
      ...app.toObject(),
      workerProfile: profileMap[String(app.workerId?._id)] || null,
      payment: paymentMap[String(app._id)] || null
    }));
    console.log(
  "Enriched Applications:",
  JSON.stringify(enriched, null, 2)
);
    
    res.json({ success: true, data: { applications: enriched, job } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToApplication = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Status must be Accepted or Rejected.' });
    const application = await Application.findOne({ _id: req.params.id, organizerId: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.status !== 'Pending') return res.status(400).json({ success: false, message: 'Can only respond to pending applications.' });
    if (status === 'Accepted') {
      const job = await Job.findById(application.jobId);
      if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
      if (isJobExpired(job)) {
        job.status = 'Completed';
        await job.save();
        return res.status(400).json({ success: false, message: 'This event is already completed.' });
      }

      const updatedJob = await Job.findOneAndUpdate(
        {
          _id: application.jobId,
          status: 'Active',
          $expr: { $lt: ['$slotsFilled', '$slotsTotal'] }
        },
        { $inc: { slotsFilled: 1 } },
        { new: true }
      );

      if (!updatedJob) {
        return res.status(400).json({ success: false, message: 'This event is not accepting more workers.' });
      }

      await OrganizerProfile.findOneAndUpdate({ userId: req.user._id }, { $inc: { 'statistics.totalHires': 1 } });
      application.status = status;
      application.respondedAt = new Date();
      // Auto-create chat conversation so both parties can message immediately
      await createConversationForApplication(application);
    }
    if (status === 'Rejected') {
      application.status = status;
      application.respondedAt = new Date();
    }
    await application.save();
    res.json({ success: true, message: `Application ${status.toLowerCase()}.`, data: { application } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, workerId: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.status !== 'Pending') return res.status(400).json({ success: false, message: 'Can only withdraw pending applications.' });
    application.status = 'Withdrawn';
    await application.save();
    await Job.findByIdAndUpdate(application.jobId, [
      {
        $set: {
          applicantCount: {
            $max: [0, { $subtract: [{ $ifNull: ['$applicantCount', 0] }, 1] }]
          }
        }
      }
    ]);
    res.json({ success: true, message: 'Application withdrawn.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Organizer marks gig complete AND rates the worker
exports.completeAndRate = async (req, res) => {
  try {
    const { score, review } = req.body;
    if (!score || Number(score) < 1 || Number(score) > 5) return res.status(400).json({ success: false, message: 'Score must be 1–5.' });
    const application = await Application.findOne({ _id: req.params.id, organizerId: req.user._id, status: 'Accepted' });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found or not Accepted.' });
    application.status = 'Completed';
    application.completedAt = new Date();
    application.workerRating = { score: Number(score), review: review || '', ratedAt: new Date() };
    // application.rating = { score: Number(score), review: review || '', ratedAt: new Date() }; // legacy
    await application.save();
    const allRatings = await Application.find({ workerId: application.workerId, 'workerRating.score': { $ne: null } });
    const total = allRatings.reduce(
      (s, a) => s + (a.workerRating?.score || 0),
      0
    );

    const avg = allRatings.length > 0
      ? total / allRatings.length
      : 0;
    await WorkerProfile.findOneAndUpdate(
      { userId: application.workerId },
      { $inc: { 'statistics.totalGigsCompleted': 1 }, 'ratings.average': Math.round(avg * 10) / 10, 'ratings.total': allRatings.length }
    );
    await OrganizerProfile.findOneAndUpdate({ userId: req.user._id }, { $inc: { 'statistics.completedJobs': 1 } });
    res.json({ success: true, message: 'Gig completed and worker rated.', data: { application } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Worker rates the organizer (after gig is Completed)
exports.rateOrganizer = async (req, res) => {
  try {
    const { score, review } = req.body;
    if (!score || Number(score) < 1 || Number(score) > 5) return res.status(400).json({ success: false, message: 'Score must be 1–5.' });
    const application = await Application.findOne({ _id: req.params.id, workerId: req.user._id, status: 'Completed' });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found or gig not completed.' });
    if (application.organizerRating?.score) return res.status(400).json({ success: false, message: 'Already rated this organizer.' });
    application.organizerRating = { score: Number(score), review: review || '', ratedAt: new Date() };
    await application.save();
    const allRatings = await Application.find({ organizerId: application.organizerId, 'organizerRating.score': { $ne: null } });
    const avg = allRatings.reduce((s, a) => s + (a.organizerRating?.score || 0), 0) / allRatings.length;
    await OrganizerProfile.findOneAndUpdate(
      { userId: application.organizerId },
      { 'ratings.average': Math.round(avg * 10) / 10, 'ratings.total': allRatings.length }
    );
    res.json({ success: true, message: 'Organizer rated successfully.', data: { application } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
