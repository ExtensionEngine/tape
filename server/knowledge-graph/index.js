'use strict';

const ctrl = require('./graph.controller');
const { parseNumericParam } = require('../common/middleware');
const router = require('express').Router();

router
  .param('repositoryId', parseNumericParam)
  .get('/', ctrl.getCohortGraph)
  .post('/', ctrl.upsert)
  .delete('/:repositoryId', ctrl.destroy);

module.exports = { router };
