'use strict';

const auth = require('./common/auth').authenticate('jwt');
const cohort = require('./cohort');
const express = require('express');

const router = express.Router();
router.use(auth);
router.use(cohort.path, cohort.router);

module.exports = router;
