'use strict';

const event = require('../event');
const graph = require('../knowledge-graph');
const router = require('express').Router();

router
  .use('/:cohortId*', parseCohortId)
  .use('/:cohortId/graph', graph.router)
  .use('/:cohortId/event', event.router);

module.exports = {
  path: '/cohort',
  router
};

function parseCohortId(req, _, next) {
  req.cohortId = parseInt(req.params.cohortId, 10);
  next();
}
