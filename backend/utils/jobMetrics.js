const Application = require('../models/Application');
const Job = require('../models/Job');

const syncApplicantCounts = async (jobFilter = {}) => {
  const jobs = await Job.find(jobFilter).select('_id').lean();
  if (jobs.length === 0) return;

  const jobIds = jobs.map(({ _id }) => _id);
  const counts = await Application.aggregate([
    {
      $match: {
        jobId: { $in: jobIds },
        status: { $ne: 'Withdrawn' }
      }
    },
    { $group: { _id: '$jobId', count: { $sum: 1 } } }
  ]);

  const countByJobId = new Map(
    counts.map(({ _id, count }) => [String(_id), count])
  );

  await Job.bulkWrite(
    jobIds.map((jobId) => ({
      updateOne: {
        filter: { _id: jobId },
        update: {
          $set: { applicantCount: countByJobId.get(String(jobId)) || 0 }
        }
      }
    }))
  );
};

module.exports = { syncApplicantCounts };
