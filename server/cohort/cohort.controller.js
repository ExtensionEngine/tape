'use strict';

const { LearnerProfile } = require('../common/database');

async function getLearnerGraph({ cohortId, learnerId }, res) {
  const where = { cohortId, userId: learnerId };
  const [learnerProfile] = await LearnerProfile.findOrCreate({ where });
  const { repositories, nodes } = await learnerProfile.getProfile();
  return res.jsend.success({ cohortId, learnerId, repositories, nodes });
}

module.exports = {
  getLearnerGraph
};
