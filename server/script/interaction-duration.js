'use strict';

const db = require('../common/database');
const graphService = require('../knowledge-graph/graph.service');
const mapValues = require('lodash/mapValues');
const omit = require('lodash/omit');
const Promise = require('bluebird');

const { LearnerProfile } = db;
const commands = { aggregate, remove };
const removeDuration = state => mapValues(state, it => omit(it, ['duration']));
const noAction = () => {
  const cmdNames = Object.keys(commands).join(', ');
  throw Error(`Action does not exist! Valid actions: ${cmdNames}.`);
};

const input = process.argv[2];
const action = commands[input] || noAction;
LearnerProfile.findAll()
  .then(profiles => action(profiles))
  .then(() => console.log(`Duration successfully ${input}d`))
  .catch(err => console.error(err.message) || 1)
  .then((code = 0) => process.exit(code));

async function aggregate(profiles) {
  await graphService.initialize(db);
  await Promise.mapSeries(profiles, profile => {
    const graph = graphService.get(profile.cohortId);
    const leafNodes = graph.getLeafNodes();
    return Promise.map(leafNodes, node => profile.aggregateStats(node));
  });
  return Promise.mapSeries(profiles, profile => profile.save());
}

function remove(profiles) {
  return Promise.mapSeries(profiles, profile => {
    const state = removeDuration(profile.state);
    const repoState = removeDuration(profile.repoState);
    profile.set('duration', 0);
    profile.set('state', state);
    profile.set('repoState', repoState);
    return profile.save();
  });
}
