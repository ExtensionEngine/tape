'use strict';

const HttpStatus = require('http-status');
const isObject = require('lodash/isObject');
const { LearnerProfile } = require('../common/database');
const map = require('lodash/map');

const { OK } = HttpStatus;

function registerProfiles({ body: { cohorts }, userId }, res) {
  const profiles = map(cohorts, it => {
    return isObject(it) ? { userId, ...it } : { userId, cohortId: it };
  });
  return LearnerProfile.bulkUpsert(profiles).then(() => res.status(OK).end());
}

module.exports = { registerProfiles };
