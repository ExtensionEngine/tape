'use strict';

const auth = require('./common/auth').authenticate('jwt');
const cohort = require('./cohort');
const express = require('express');
const learner = require('./learner');
const pkg = require('../package.json');

const router = express.Router();
router.use('/ping', (_, res) => res.jsend.success({ version: pkg.version }));
router.use(auth);
router.use(cohort.path, cohort.router);
router.use(learner.path, learner.router);

module.exports = router;
