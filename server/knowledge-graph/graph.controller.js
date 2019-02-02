'use strict';

const get = require('lodash/get');
const graphService = require('./GraphService');
const HttpStatus = require('http-status');
const { RepositoryGraph } = require('../common/database');
const validate = require('./validation');

const { BAD_REQUEST, OK } = HttpStatus;

function getCohortGraph({ cohortId }, res) {
  const graph = graphService.get(cohortId);
  return res.jsend.success(graph.nodes);
}

function upsert({ cohortId, body }, res) {
  const data = { cohortId, ...body };
  return validate(data)
    .then(() => RepositoryGraph.upsert(data))
    .then(() => {
      graphService.add(data);
      return res.status(OK).end();
    })
    .catch(err => res.status(BAD_REQUEST).json({ errors: processError(err) }));
}

function processError(error) {
  return {
    message: get(error, 'cause.name') || error.message || 'Error',
    info: get(error, 'cause.details') || get(error, 'errors') || error
  };
}

module.exports = {
  getCohortGraph,
  upsert
};