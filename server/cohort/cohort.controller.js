'use strict';

const { LearnerProfile, Sequelize } = require('../common/database');
const Op = Sequelize.Op;
const pick = require('lodash/pick');

async function listGraphs({ cohortId, params }, res) {
  const where = { cohortId };
  if (params.userId) where.userId = { [Op.in]: params.userId };
  const profiles = await LearnerProfile.findAll({ where });
  const data = profiles.map(it => ({
    ...pick(it, ['cohortId', 'userId', 'progress']),
    ...it.getProfile()
  }));
  return res.jsend.success(data);
}

async function getGraph({ cohortId, learnerId }, res) {
  const where = { cohortId, userId: learnerId };
  const [learnerProfile] = await LearnerProfile.findOrCreate({ where });
  const { repositories, nodes } = learnerProfile.getProfile();
  return res.jsend.success({
    ...pick(learnerProfile, ['cohortId', 'userId', 'progress']),
    repositories,
    nodes
  });
}

module.exports = {
  getGraph,
  listGraphs
};
