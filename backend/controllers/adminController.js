const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');
const OrganizerProfile = require('../models/OrganizerProfile');


// ─────────────────────────────────────────────
// ✅ DASHBOARD
// ─────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    // 🔢 Counts
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalWorkers,
      totalOrganizers,
      activeJobs,
      pendingKyc
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'organizer' }),
      Job.countDocuments({ status: 'Active' }),
      User.countDocuments({ kycStatus: { $in: ['pending', 'in_progress'] } })
    ]);

    // 🆕 Recent Users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email role createdAt');

    // 🆕 Recent Jobs
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title location createdAt');

    // ✅ FINAL RESPONSE (MATCHES YOUR FRONTEND)
    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalWorkers,
          totalOrganizers,
          totalJobs,
          activeJobs,
          totalApplications,
          pendingKyc
        },
        recentUsers,
        recentJobs
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ─────────────────────────────────────────────
// ✅ ANALYTICS (basic)
// ─────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const activeJobs = await Job.countDocuments({ status: 'Active' });
    const completedJobs = await Job.countDocuments({ status: 'Completed' });

    res.json({
      success: true,
      data: { activeJobs, completedJobs }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────
// ✅ GET ALL USERS
// ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, kycStatus, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter.kycStatus = kycStatus;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────
// ✅ GET USER BY ID
// ─────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'organizer') {
      profile = await OrganizerProfile.findOne({ userId: user._id });
    } else if (user.role === 'worker') {
      profile = await WorkerProfile.findOne({ userId: user._id });
    }

    const applications = await Application.find(
      user.role === 'worker'
        ? { workerId: user._id }
        : { organizerId: user._id }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('jobId', 'title date');

    res.json({
      success: true,
      data: { user, profile, applications }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────
// ✅ TOGGLE USER STATUS (active/inactive)
// ─────────────────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: 'User status updated',
      data: { user }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────
// ✅ UPDATE KYC
// ─────────────────────────────────────────────
exports.updateKyc = async (req, res) => {
  try {
    const { kycStatus } = req.body;

    const validStatuses = ['pending', 'in_progress', 'verified', 'rejected'];
    if (!validStatuses.includes(kycStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid KYC status.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'KYC updated',
      data: { user }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────
// ✅ GET ALL JOBS
// ─────────────────────────────────────────────
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('organizerId', 'fullName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { jobs } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────
// ✅ UPDATE JOB STATUS
// ─────────────────────────────────────────────
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    res.json({
      success: true,
      message: 'Job status updated',
      data: { job }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─────────────────────────────────────────────
// ✅ DELETE JOB
// ─────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    await Application.deleteMany({ jobId: job._id });

    res.json({
      success: true,
      message: 'Job deleted'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};