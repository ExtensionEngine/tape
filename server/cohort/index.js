'use strict';

const ctrl = require('./cohort.controller');
const event = require('../event');
const graph = require('../knowledge-graph');
const { LearnerProfile } = require('../common/database');
const router = require('express').Router();
const { setParser } = require('../common/pagination');

router
  .use('/:cohortId*', parseCohortId)
  .use('/:cohortId/graph', graph.router)
  .use('/:cohortId/event', event.router)
  .get('/:cohortId/progress', ctrl.getCohortProgress)
  .post('/:cohortId/register', ctrl.registerLearners)
  .use('/:cohortId/learner/:learnerId*', parseLearnerId)
  .get('/:cohortId/learner/:learnerId', ctrl.getGraph)
  .get('/:cohortId/learner/', setParser(LearnerProfile), ctrl.listLearners);

module.exports = {
  path: '/cohort',
  router
};

function parseCohortId(req, _, next) {
  req.cohortId = parseInt(req.params.cohortId, 10);
  next();
}

function parseLearnerId(req, _, next) {
  req.learnerId = parseInt(req.params.learnerId, 10);
  next();
}
