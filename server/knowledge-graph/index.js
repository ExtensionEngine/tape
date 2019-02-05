'use strict';

const ctrl = require('./graph.controller');
const router = require('express').Router();

router
  .get('/', ctrl.getCohortGraph)
  .post('/', ctrl.upsert)
  .use('/:repositoryId*', parseRepositoryId)
  .delete('/:repositoryId', ctrl.destroy);

module.exports = { router };

function parseRepositoryId(req, _, next) {
  req.repositoryId = parseInt(req.params.repositoryId, 10);
  next();
}
