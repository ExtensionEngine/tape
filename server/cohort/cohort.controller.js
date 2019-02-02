'use strict';

const { LearnerProfile } = require('../common/database');

async function getLearnerGraph({ cohortId, learnerId }, res) {
  const where = { cohortId, userId: learnerId };
  const [learnerProfile] = await LearnerProfile.findOrCreate({ where });
  const graph = await learnerProfile.getProfile();
  return res.jsend.success({ cohortId, learnerId, graph });
}

module.exports = {
  getLearnerGraph
};
