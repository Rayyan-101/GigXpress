const express = require('express');
const router = express.Router();

const Job = require('../models/Job');
const OrganizerProfile = require('../models/OrganizerProfile');
const Application = require('../models/Application');
const User = require('../models/User');

const { protect } = require('../middleware/auth');


// ─────────────────────────────────────────────
// ✅ CREATE JOB (Advanced with KYC)
// ─────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      title, description, category, date, time, duration,
      location, pay, slotsTotal, requiredSkills, requirements, urgent
    } = req.body;

    // 🔒 KYC Check
    const organizer = await User.findById(req.user._id).select('kycStatus');
    if (!organizer || organizer.kycStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        kycRequired: true,
        kycStatus: organizer?.kycStatus || 'pending',
        message: 'KYC verification required before posting jobs.'
      });
    }

    // 🧾 Validation
    if (!title || !date || !time || !location || !pay || !slotsTotal) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields.'
      });
    }

    const job = await Job.create({
      organizerId: req.user._id,
      title: title.trim(),
      description: description || '',
      category: category || 'Other',
      date: new Date(date),
      time,
      duration: duration || 'Full Day',
      location: typeof location === 'string'
        ? { city: location, address: location }
        : location,
      pay: typeof pay === 'object'
  ? {
      amount: Number(pay.amount),
      type: pay.type === 'hourly' ? 'hourly' : 'fixed' // ✅ SAFE
    }
  : { amount: Number(pay), type: 'fixed' },
      slotsTotal: Number(slotsTotal),
      requiredSkills: requiredSkills || [],
      requirements: requirements || '',
      urgent: urgent || false
    });

    // 📊 Update organizer stats
    await OrganizerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { 'statistics.totalJobsPosted': 1, 'statistics.activeJobs': 1 } }
    );

    res.status(201).json({
      success: true,
      message: 'Job posted successfully!',
      data: { job }
    });

  } catch (error) {
    console.error('CREATE JOB ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// ✅ GET ALL JOBS (Advanced filtering + pagination)
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { city, skill, category, search, page = 1, limit = 20 } = req.query;

    const filter = {
      status: 'Active',
      date: { $gte: new Date() }
    };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (category) filter.category = category;
    if (skill) filter.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    if (search) filter.title = new RegExp(search, 'i');

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('organizerId', 'fullName profilePicture')
        .sort({ urgent: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('GET JOBS ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// ✅ GET MY JOBS
// ─────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ organizerId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { jobs } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// ✅ GET SINGLE JOB
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('organizerId', 'fullName profilePicture');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    res.json({ success: true, data: { job } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// ✅ UPDATE JOB (Safe update)
// ─────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      organizerId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    const allowedFields = [
      'title','description','category','date','time','duration',
      'location','pay','slotsTotal','requiredSkills','requirements','urgent','status'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();

    // 📊 Update active jobs count
    if (req.body.status) {
      const delta = req.body.status === 'Active' ? 1 : -1;

      await OrganizerProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { 'statistics.activeJobs': delta } }
      );
    }

    res.json({
      success: true,
      message: 'Job updated.',
      data: { job }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────────
// ✅ DELETE JOB (with cascade delete)
// ─────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      organizerId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }

    // 📊 Update stats
    await OrganizerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { 'statistics.activeJobs': -1 } }
    );

    // 🧹 Delete related applications
    await Application.deleteMany({ jobId: job._id });

    res.json({
      success: true,
      message: 'Job deleted.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;