const Notification = require('../models/Notification');
const User = require('../models/User');

const emitNotification = (io, recipientId, notification) => {
  if (!io || !recipientId || !notification) return;
  io.to(`user:${recipientId}`).emit('notification:new', notification);
};

const createNotification = async ({ io, recipientId, actorId = null, type, title, message, link = '', metadata = {} }) => {
  const notification = await Notification.create({
    recipientId,
    actorId,
    type,
    title,
    message,
    link,
    metadata
  });

  emitNotification(io, recipientId, notification);
  return notification;
};

const notifyWorkersAboutNewJob = async ({ io, job, organizer }) => {
  const workers = await User.find({ role: 'worker', isActive: true }).select('_id');
  if (!workers.length) return [];

  const docs = workers.map((worker) => ({
    recipientId: worker._id,
    actorId: organizer?._id || job.organizerId,
    type: 'new_job',
    title: 'New gig posted',
    message: `${organizer?.fullName || 'An organizer'} posted "${job.title}" in ${job.location?.city || 'your area'}.`,
    link: '/volunteer',
    metadata: { jobId: job._id }
  }));

  const notifications = await Notification.insertMany(docs);
  notifications.forEach((notification) => {
    emitNotification(io, notification.recipientId, notification);
  });

  return notifications;
};

module.exports = {
  createNotification,
  notifyWorkersAboutNewJob
};
