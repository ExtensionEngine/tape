'use strict';

const ctrl = require('./learner.controller');
const { parseNumericParam } = require('../common/middleware');
const router = require('express').Router();

router
  .param('userId', parseNumericParam)
  .post('/:userId/register', ctrl.registerProfiles);

module.exports = {
  path: '/learners',
  router
};
