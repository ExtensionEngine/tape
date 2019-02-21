'use strict';

const { LearnerProfile, Sequelize } = require('../common/database');
const difference = require('lodash/difference');
const graphService = require('../knowledge-graph/graph.service');
const HttpStatus = require('http-status');
const map = require('lodash/map');
const Op = Sequelize.Op;
const pick = require('lodash/pick');

const { OK } = HttpStatus;

const processOutput = profile => ({
  ...pick(profile, ['cohortId', 'userId', 'progress']),
  ...profile.getProfile()
});

function listGraphs({ cohortId, query, options }, res) {
  const where = { cohortId };
  const opts = { where, ...options };
  if (query.userId) where.userId = { [Op.in]: query.userId };
  return LearnerProfile.findAndCountAll(opts).then(({ rows, count }) => {
    return res.jsend.success({ items: rows.map(processOutput), total: count });
  });
}

function getGraph({ cohortId, learnerId }, res) {
  const where = { cohortId, userId: learnerId };
  return LearnerProfile.findOrCreate({ where }).spread(profile => {
    const cohortProgress = graphService.getCohortProgress(cohortId);
    return res.jsend.success({ ...processOutput(profile), cohortProgress });
  });
}

function getCohortProgress({ cohortId }, res) {
  return res.jsend.success({
    progress: graphService.getCohortProgress(cohortId)
  });
}

async function registerLearners({ cohortId, body }, res) {
  const { userIds } = body;
  const where = { cohortId, userId: { [Op.in]: userIds } };
  const existing = await LearnerProfile.findAll({ where, attributes: ['userId'] });
  const diff = difference(userIds, map(existing, 'userId'));
  return LearnerProfile.bulkCreate(map(diff, userId => ({ cohortId, userId })))
    .then(() => res.status(OK).end());
}

module.exports = {
  getGraph,
  listGraphs,
  getCohortProgress,
  registerLearners
};
