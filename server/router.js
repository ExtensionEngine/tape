'use strict';

const auth = require('./common/auth').authenticate('jwt');
const cohort = require('./cohort');
const express = require('express');
const { Sequelize } = require('./common/database');

const router = express.Router();
router.use(auth);
router.use('/', parseOptions);
router.use(cohort.path, cohort.router);

module.exports = router;

function parseOptions(req, _, next) {
  const options = {
    limit: parseInt(req.query.limit, 10) || 100,
    offset: parseInt(req.query.offset, 10) || 0
  };
  let { sortBy } = req.query;
  if (sortBy) {
    if (sortBy.includes('.')) sortBy = Sequelize.literal(sortBy);
    options.order = [[sortBy, req.query.sortOrder || 'ASC']];
  }
  req.options = options;
  next();
}
