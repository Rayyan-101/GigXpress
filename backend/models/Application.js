const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Withdrawn', 'Completed'],
      default: 'Pending'
    },
    coverNote: {
      type: String,
      maxlength: [500, 'Cover note cannot exceed 500 characters'],
      default: ''
    },
    appliedAt:   { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // Organizer → Worker rating (organizer rates after gig)
    workerRating: {
      score:   { type: Number, min: 1, max: 5, default: null },
      review:  { type: String, default: '' },
      ratedAt: { type: Date, default: null }
    },

    // Worker → Organizer rating (volunteer rates after gig)
    organizerRating: {
      score:   { type: Number, min: 1, max: 5, default: null },
      review:  { type: String, default: '' },
      ratedAt: { type: Date, default: null }
    },

    // Legacy field — kept for backward compatibility
    rating: {
      score:   { type: Number, min: 1, max: 5, default: null },
      review:  { type: String, default: '' },
      ratedAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });
applicationSchema.index({ workerId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ organizerId: 1 });

module.exports = mongoose.model('Application', applicationSchema);