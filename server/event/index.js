'use strict';

const ctrl = require('./event.controller');
const { processPagination } = require('../common/pagination');
const router = require('express').Router();
const { UngradedEvent } = require('../common/database');

router
  .get('/ungraded', processPagination(UngradedEvent), ctrl.listUngradedEvents)
  .post('/ungraded', ctrl.reportUngradedEvent)
  .post('/graded', ctrl.reportGradedEvent);

module.exports = {
  path: '/event',
  router
};
