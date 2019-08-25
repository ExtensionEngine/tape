'use strict';

const { 'migrations-path': migrationsPath } = require('../../../.sequelizerc');
const config = require('./config');
const filter = require('lodash/filter');
const forEach = require('lodash/forEach');
const invoke = require('lodash/invoke');
const logger = require('../logger')();
const map = require('lodash/map');
const Sequelize = require('sequelize');
const Umzug = require('umzug');
const utils = require('./utils');

// Require models.
const Integration = require('../../integration/integration.model');
const GradedEvent = require('../../event/graded-event.model');
const RepositoryGraph = require('../../knowledge-graph/repository-graph.model');
const UngradedEvent = require('../../event/ungraded-event.model');
const LearnerProfile = require('../../knowledge-graph/learner-profile.model');

const isProduction = process.env.NODE_ENV === 'production';
const sequelize = createConnection(config);
const { Sequelize: { DataTypes } } = sequelize;

const defineModel = Model => {
  const fields = invoke(Model, 'fields', DataTypes, sequelize) || {};
  const hooks = invoke(Model, 'hooks') || {};
  const scopes = invoke(Model, 'scopes', sequelize) || {};
  const options = invoke(Model, 'options') || {};
  return Model.init(fields, { sequelize, hooks, scopes, ...options });
};

function initialize() {
  const umzug = new Umzug({
    logging: message => logger.info('[Migration]', message),
    storage: 'sequelize',
    storageOptions: {
      sequelize,
      tableName: config.migrationStorageTableName
    },
    migrations: {
      params: [sequelize.getQueryInterface(), Sequelize],
      path: migrationsPath
    }
  });

  return Promise.resolve(!isProduction && umzug.up())
    .then(() => umzug.executed())
    .then(migrations => {
      const files = migrations.map(it => it.file);
      if (!files.length) return;
      logger.info('⬆️  Executed migrations:', files);
    });
}

const models = {
  Integration: defineModel(Integration),
  RepositoryGraph: defineModel(RepositoryGraph),
  GradedEvent: defineModel(GradedEvent),
  UngradedEvent: defineModel(UngradedEvent),
  LearnerProfile: defineModel(LearnerProfile)
};

forEach(models, model => {
  invoke(model, 'associate', models);
  invoke(model, 'addHooks', models);
});

const db = {
  Sequelize,
  sequelize,
  initialize,
  utils,
  ...models
};

// Patch Sequelize#method to support getting models by class name.
sequelize.model = name => sequelize.models[name] || db[name];

// NOTE: Override `QueryInterface#bulkInsert` to support custom field names.
const queryInterface = sequelize.getQueryInterface();
const { bulkInsert } = queryInterface;
queryInterface.bulkInsert = function (tableName, records, options, attributes) {
  if (options.upsertKeys) {
    const keys = filter(attributes, it => it.primaryKey || it.unique);
    options.upsertKeys = map(keys, 'field');
  }
  return bulkInsert.call(this, tableName, records, options, attributes);
};

module.exports = db;

function createConnection(config) {
  if (!config.url) return new Sequelize(config);
  return new Sequelize(config.url, config);
}
