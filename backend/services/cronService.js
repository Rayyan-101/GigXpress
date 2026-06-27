// backend/services/cronService.js
// Runs daily at midnight to auto-complete past-date jobs
const cron = require('node-cron');
const Application = require('../models/Application');
const Job  = require('../models/Job');

const startCronJobs = () => {
  // Every day at 00:05 AM
  cron.schedule('5 0 * * *', async () => {
    console.log('⏰ Cron: Checking for jobs to auto-complete...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const jobsToComplete = await Job.find({
  date: { $lte: yesterday },
  status: { $in: ['Active', 'Paused'] },
}).select('_id');

const jobIds = jobsToComplete.map(job => job._id);

// Mark jobs as completed
const result = await Job.updateMany(
  {
    _id: { $in: jobIds }
  },
  {
    $set: { status: 'Completed' }
  }
);

// Mark accepted applications for those jobs as completed
await Application.updateMany(
  {
    jobId: { $in: jobIds },
    status: 'Accepted'
  },
  {
    $set: {
      status: 'Completed'
    }
  }
);

      if (result.modifiedCount > 0) {
        console.log(`✅ Cron: Auto-completed ${result.modifiedCount} job(s).`);
      } else {
        console.log('✅ Cron: No jobs needed auto-completion.');
      }
    } catch (err) {
      console.error('❌ Cron job failed:', err.message);
    }
  }, {
    scheduled: true,
    timezone:  'Asia/Kolkata',
  });

  console.log('⏰ Cron jobs started (timezone: Asia/Kolkata)');
};

module.exports = { startCronJobs };