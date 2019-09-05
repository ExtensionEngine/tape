'use strict';

const HttpStatus = require('http-status');
const isObject = require('lodash/isObject');
const { LearnerProfile } = require('../common/database');
const map = require('lodash/map');

const { OK } = HttpStatus;

function registerProfiles({ body: { cohorts }, userId }, res) {
  const profiles = map(cohorts, it => {
    const profile = isObject(it) ? it : { cohortId: it };
    return { ...profile, userId };
  });
  const updateOnDuplicate = ['inCohortAnalytics'];
  return LearnerProfile.bulkCreate(profiles, { updateOnDuplicate })
    .then(() => res.status(OK).end());
}

module.exports = { registerProfiles };
