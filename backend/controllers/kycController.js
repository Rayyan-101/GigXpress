const KycSubmission = require('../models/KycSubmission');
const User          = require('../models/User');

// ─── POST /api/kyc/submit — User submits KYC documents ────────────────────────
exports.submitKyc = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Block re-submission if already verified
    if (user.kycStatus === 'verified') {
      return res.status(400).json({ success: false, message: 'KYC already verified.' });
    }

    const {
      fullName, dateOfBirth, address,
      aadhaarNumber, aadhaarFront, aadhaarBack,
      panNumber, panFront,
      selfie, gstCertificate
    } = req.body;

    if (!fullName || !dateOfBirth || !address || !aadhaarNumber || !aadhaarFront || !aadhaarBack || !panNumber || !panFront || !selfie) {
      return res.status(400).json({ success: false, message: 'All required documents must be provided.' });
    }

    // Upsert — replace if previously rejected
    const submission = await KycSubmission.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId:          req.user._id,
        role:            user.role,
        fullName,
        dateOfBirth,
        address,
        aadhaarNumber,
        aadhaarFront,
        aadhaarBack,
        panNumber,
        panFront,
        selfie,
        gstCertificate:  gstCertificate || null,
        status:          'submitted',
        rejectionReason: '',
        reviewedBy:      null,
        reviewedAt:      null,
        submittedAt:     new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update user kycStatus to in_progress
    await User.findByIdAndUpdate(req.user._id, { kycStatus: 'in_progress' });

    res.status(201).json({
      success: true,
      message: 'KYC documents submitted successfully. Our team will review within 24 hours.',
      data: { submission: { _id: submission._id, status: submission.status } }
    });
  } catch (error) {
    console.error('submitKyc error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/kyc/my — Get own KYC submission ─────────────────────────────────
exports.getMyKyc = async (req, res) => {
  try {
    const [user, submission] = await Promise.all([
      User.findById(req.user._id).select('-password'),
      KycSubmission.findOne({ userId: req.user._id })
    ]);

    res.json({
      success: true,
      data: {
        kycStatus:  user.kycStatus,
        submission: submission || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/kyc/admin/all — Admin views all pending KYC submissions ──────────
exports.getAllSubmissions = async (req, res) => {
  try {
    const { status = 'submitted', page = 1, limit = 20 } = req.query;

    const filter = status !== 'all' ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [submissions, total] = await Promise.all([
      KycSubmission.find(filter)
        .populate('userId', 'fullName email phone role')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      KycSubmission.countDocuments(filter)
    ]);

    res.json({ success: true, data: { submissions, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/kyc/admin/:id — Admin views one submission ──────────────────────
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await KycSubmission.findById(req.params.id)
      .populate('userId', 'fullName email phone role kycStatus');

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

    res.json({ success: true, data: { submission } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/kyc/admin/:id/review — Admin approves or rejects ──────────────
exports.reviewSubmission = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject.' });
    }

    const submission = await KycSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    submission.status          = newStatus;
    submission.rejectionReason = action === 'reject' ? (rejectionReason || 'Documents unclear or invalid.') : '';
    submission.reviewedBy      = req.user._id;
    submission.reviewedAt      = new Date();
    await submission.save();

    // Update User.kycStatus accordingly
    const userKycStatus = action === 'approve' ? 'verified' : 'rejected';
    await User.findByIdAndUpdate(submission.userId, { kycStatus: userKycStatus });

    res.json({
      success: true,
      message: `KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      data: { submission }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};