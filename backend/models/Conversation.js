const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Last message preview for conversation list
    lastMessage: {
      text:      { type: String, default: '' },
      senderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      sentAt:    { type: Date, default: null },
    },
    // Unread counts per participant
    unreadCount: {
      organizer: { type: Number, default: 0 },
      worker:    { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One conversation per application (one job + one worker pair)
conversationSchema.index({ applicationId: 1 }, { unique: true });
conversationSchema.index({ organizerId: 1 });
conversationSchema.index({ workerId: 1 });
conversationSchema.index({ jobId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);