'use strict';

const ctrl = require('./graph.controller');
const router = require('express').Router();

router
  .get('/', ctrl.getCohortGraph)
  .post('/', ctrl.upsert);

module.exports = { router };
