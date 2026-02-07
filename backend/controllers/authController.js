const User = require('../models/User');
const OrganizerProfile = require('../models/OrganizerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register new user (Organizer or Worker)
// @route   POST /api/auth/register/:role
// @access  Public
exports.register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { role } = req.params; // 'organizer' or 'worker'
    const formData = req.body;

    // Validate role
    if (!['organizer', 'worker'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role specified' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: formData.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: formData.phone });
    if (existingPhone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number already registered' 
      });
    }

    // Create user
    const user = await User.create({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: role
    });

    // Create role-specific profile
    if (role === 'organizer') {
      await OrganizerProfile.create({
        userId: user._id,
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        gstNumber: formData.gstNumber || null,
        address: {
          fullAddress: formData.address,
          // You can parse address later for city, state, pincode
        }
      });
    } else if (role === 'worker') {
      await WorkerProfile.create({
        userId: user._id,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        location: {
          city: formData.location, // Parse this properly
          state: '', // Extract from location string
          pincode: ''
        },
        skills: formData.skills || [],
        experienceLevel: formData.experience || 'beginner'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, user._id);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          kycStatus: user.kycStatus
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          kycStatus: user.kycStatus,
          profilePicture: user.profilePicture
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get role-specific profile
    let profile = null;
    if (user.role === 'organizer') {
      profile = await OrganizerProfile.findOne({ userId: user._id });
    } else if (user.role === 'worker') {
      profile = await WorkerProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};