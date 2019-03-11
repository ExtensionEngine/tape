'use strict';

const ctrl = require('./cohort.controller');
const event = require('../event');
const graph = require('../knowledge-graph');
const { parseNumericParam } = require('../common/middleware');
const router = require('express').Router();

router
  .param('cohortId', parseNumericParam)
  .param('learnerId', parseNumericParam)
  .use('/:cohortId/graph', graph.router)
  .use('/:cohortId/event', event.router)
  .get('/:cohortId/progress', ctrl.getCohortProgress)
  .post('/:cohortId/register', ctrl.registerLearners)
  .get('/:cohortId/learner/:learnerId', ctrl.getLearnerStats)
  .get('/:cohortId/learner/', ctrl.listLearnerStats);

module.exports = {
  path: '/cohort',
  router
};
