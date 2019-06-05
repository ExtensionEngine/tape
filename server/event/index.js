'use strict';

const ctrl = require('./event.controller');
const router = require('express').Router();

router
  .post('/ungraded', ctrl.reportUngradedEvent)
  .post('/graded', ctrl.reportGradedEvent);

module.exports = {
  path: '/event',
  router
};
