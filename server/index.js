'use strict';

const bluebird = require('bluebird');
const graphService = require('./knowledge-graph/GraphService');
const { promisify } = require('util');
const sequelize = require('sequelize');

if (process.env.NODE_ENV !== 'production') {
  sequelize.Promise.config({ longStackTraces: true });
  bluebird.config({ longStackTraces: true });
}

const app = require('./app');
const config = require('./config');
const database = require('./common/database');
const logger = require('./common/logger')();
const runServer = promisify(app.listen.bind(app));

const address = `http://${config.ip}:${config.port}`;

database.initialize()
  .then(migrations => logger.info('🗄️  Database initialized'))
  .then(() => graphService.initialize(database))
  .then(() => runServer(config.port, config.ip))
  .then(() => logger.info(`✈️  Server listening on ${address}`))
  .catch(err => logger.error({ err }));
