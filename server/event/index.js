'use strict';

const ctrl = require('./event.controller');
const router = require('express').Router();
const { UngradedEvent } = require('../common/database');
const { setParser } = require('../common/pagination');

router
  .get('/ungraded', setParser(UngradedEvent), ctrl.listUngradedEvents)
  .post('/ungraded', ctrl.reportUngradedEvent)
  .post('/graded', ctrl.reportGradedEvent);

module.exports = {
  path: '/event',
  router
};
