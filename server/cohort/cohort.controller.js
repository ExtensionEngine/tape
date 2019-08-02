'use strict';

const { LearnerProfile, Sequelize } = require('../common/database');
const differenceBy = require('lodash/differenceBy');
const graphService = require('../knowledge-graph/graph.service');
const find = require('lodash/find');
const HttpStatus = require('http-status');
const isObject = require('lodash/isObject');
const map = require('lodash/map');
const Op = Sequelize.Op;
const pick = require('lodash/pick');
const Promise = require('bluebird');

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
  const users = map(body.userIds, it => isObject(it) ? it : { userId: it });
  users.forEach(it => (it.cohortId = cohortId));
  const where = { cohortId, userId: { [Op.in]: map(users, 'userId') } };
  const existing = await LearnerProfile.findAll({ where });
  const diff = differenceBy(users, existing, 'userId');
  await Promise.map(existing, it => it.update(find(users, { userId: it.userId })));
  await LearnerProfile.bulkCreate(diff);
  await graphService.updateCohortProgress(cohortId);
  return res.status(OK).end();
}

module.exports = {
  getLearnerStats,
  listLearnerStats,
  getCohortProgress,
  registerLearners
};
