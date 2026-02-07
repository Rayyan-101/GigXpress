const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: true
    },
    location: {
      city: { type: String, required: true },
      state: String,
      pincode: String
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'At least one skill is required'
      }
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'experienced'],
      default: 'beginner'
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    badges: [{
      name: String,
      icon: String,
      awardedBy: mongoose.Schema.Types.ObjectId,
      awardedAt: { type: Date, default: Date.now },
      description: String
    }],
    statistics: {
      totalGigsApplied: { type: Number, default: 0 },
      totalGigsCompleted: { type: Number, default: 0 },
      totalGigsCancelled: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      currentMonthEarnings: { type: Number, default: 0 }
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      total: { type: Number, default: 0 },
      breakdown: {
        professionalism: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        skillLevel: { type: Number, default: 0 }
      }
    },
    reliabilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentLevel: {
      type: String,
      enum: ['beginner', 'volunteer', 'regular', 'professional', 'expert'],
      default: 'beginner'
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      preferredDays: [String], // ['monday', 'tuesday', etc.]
      preferredShifts: [String] // ['morning', 'afternoon', 'evening']
    }
  },
  {
    timestamps: true
  }
);

// Calculate age from date of birth
workerProfileSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);