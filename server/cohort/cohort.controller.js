'use strict';

const { LearnerProfile, Sequelize } = require('../common/database');
const difference = require('lodash/difference');
const graphService = require('../knowledge-graph/graph.service');
const HttpStatus = require('http-status');
const map = require('lodash/map');
const Op = Sequelize.Op;
const pick = require('lodash/pick');

const { OK } = HttpStatus;

const processOutput = (profile, includeGraph) => {
  const output = pick(profile, ['cohortId', 'userId', 'progress']);
  if (includeGraph) Object.assign(output, profile.getGraph());
  return output;
};

function listLearnerStats({ cohortId, query, options }, res) {
  const where = { cohortId };
  const opts = { where, ...options };
  if (query.userId) where.userId = { [Op.in]: query.userId };
  return LearnerProfile.findAndCountAll(opts).then(({ rows, count }) => {
    const items = rows.map(it => processOutput(it, query.includeGraph));
    return res.jsend.success({ items, total: count });
  });
}

async function getLearnerStats({ cohortId, learnerId }, res) {
  const where = { cohortId, userId: learnerId };
  return LearnerProfile.findOrCreate({ where }).spread(profile => {
    const cohortProgress = graphService.getCohortProgress(cohortId);
    return res.jsend.success({ ...processOutput(profile, true), cohortProgress });
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
  getLearnerStats,
  listLearnerStats,
  getCohortProgress,
  registerLearners
};
