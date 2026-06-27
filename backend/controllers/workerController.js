const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const Application = require('../models/Application');
const Payment = require("../models/Payment");

// ─── GET /api/workers/profile ─────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const [user, profile] = await Promise.all([
      User.findById(req.user._id),
      WorkerProfile.findOne({ userId: req.user._id })
    ]);
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    res.json({ success: true, data: { user, profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/workers/profile ─────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['bio', 'skills', 'experienceLevel', 'location', 'availability', 'gender'];
    const update = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (req.body.fullName) {
      await User.findByIdAndUpdate(req.user._id, { fullName: req.body.fullName });
    }

    res.json({ success: true, message: 'Profile updated.', data: { profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/workers/dashboard — Full stats for overview ─────────────────────
// ─── GET /api/workers/dashboard — Full stats for overview ─────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [
      user,
      profile,
      completedGigs,
      upcomingGigs,
      completedCount,
      releasedPayments,
      totalApplied
    ] = await Promise.all([
      User.findById(req.user._id),

      WorkerProfile.findOne({ userId: req.user._id }),

      Application.find({
        workerId: req.user._id,
        status: 'Completed'
      })
        .populate('jobId', 'title date pay location')
        .populate('organizerId', 'fullName')
        .sort({ respondedAt: -1 })
        .limit(10),

      Application.find({
        workerId: req.user._id,
        status: 'Accepted'
      })
        .populate('jobId', 'title date time pay location duration')
        .populate('organizerId', 'fullName')
        .sort({ 'jobId.date': 1 })
        .limit(5),

      Application.countDocuments({
        workerId: req.user._id,
        status: 'Completed'
      }),

      Payment.find({
        workerId: req.user._id,
        status: 'Released'
      }),

      Application.countDocuments({
        workerId: req.user._id
      })
    ]);

    // Calculate total earnings
    const totalEarnings = releasedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentMonthEarnings = releasedPayments
      .filter(payment =>
        payment.releasedAt &&
        new Date(payment.releasedAt) >= startOfMonth
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      success: true,
      data: {
        user,
        profile,

        stats: {
          totalEarnings,
          currentMonthEarnings,
          totalGigsCompleted: completedCount,
          totalGigsApplied: totalApplied,
          reliabilityScore: profile?.reliabilityScore || 100,
          averageRating: profile?.ratings?.average || 0,
          badges: profile?.badges || [],
          currentLevel: profile?.currentLevel || 'beginner'
        },

        completedGigs,
        upcomingGigs
      }
    });

  } catch (error) {
    console.error("Worker Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};