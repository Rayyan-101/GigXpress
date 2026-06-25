const Job = require('../models/Job');

const EVENT_TIME_ZONE = process.env.EVENT_TIME_ZONE || 'Asia/Kolkata';

const getDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
};

const getTodayBoundary = (date = new Date()) => {
  const { year, month, day } = getDateParts(date);
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
};

const isJobExpired = (job, date = new Date()) => {
  if (!job?.date) return false;
  return new Date(job.date) < getTodayBoundary(date);
};

const syncExpiredJobs = async (filter = {}) => {
  return Job.updateMany(
    {
      ...filter,
      status: { $in: ['Active', 'Paused'] },
      date: { $lt: getTodayBoundary() }
    },
    { $set: { status: 'Completed' } }
  );
};

module.exports = {
  getTodayBoundary,
  isJobExpired,
  syncExpiredJobs
};
