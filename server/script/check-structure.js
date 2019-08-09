'use strict';

const { LearnerProfile, RepositoryGraph } = require('../common/database');
const flatten = require('lodash/flatten');
const filter = require('lodash/filter');
const map = require('lodash/map');
const set = require('lodash/set');
const sumBy = require('lodash/sumBy');

// Disable Sequelize SQL logging.
set(RepositoryGraph, 'sequelize.options.logging', Function.prototype);
set(LearnerProfile, 'sequelize.options.logging', Function.prototype);

RepositoryGraph.findAll().then(graphs => {
  const nodes = flatten(map(graphs, 'nodes'));
  const content = map(filter(nodes, 'content.length'), 'content[0]');
  return map(filter(content, { type: 'CONTENT_GROUP' }), 'id');
}).then(async contentGroupIds => {
  const profiles = await LearnerProfile.findAll();
  const stateRecords = sumBy(profiles, ({ state }) => Object.keys(state).length);
  console.log(`Found ${contentGroupIds.length} "CONTENT_GROUP" elements within structure`);
  console.log(`Found ${stateRecords} node records across learners' states`);
  console.log(`Logging state records for "CONTENT_GROUP" elements if found...\n...`);
  profiles.forEach(({ state }) => {
    contentGroupIds.forEach(id => {
      if (state[id]) console.log(`${id} => ${state[id]}`);
    });
  });
  console.log(`Done!`);
}).then(() => process.exit(0));
