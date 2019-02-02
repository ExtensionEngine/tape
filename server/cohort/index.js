'use strict';

const ctrl = require('./cohort.controller');
const event = require('../event');
const graph = require('../knowledge-graph');
const router = require('express').Router();

router
  .use('/:cohortId*', parseCohortId)
  .use('/:cohortId/graph', graph.router)
  .use('/:cohortId/event', event.router)
  .use('/:cohortId/learner/:learnerId*', parseLearnerId)
  .get('/:cohortId/learner/:learnerId', ctrl.getLearnerGraph);

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