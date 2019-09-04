'use strict';

const db = require('../common/database');
const graphService = require('../knowledge-graph/graph.service');
const Promise = require('bluebird');

const { LearnerProfile } = db;

LearnerProfile.findAll()
  .then(profiles => aggregateStats(profiles))
  .then(() => console.log(`Learners' stats successfully aggregated`))
  .catch(err => console.error(err.message) || 1)
  .then((code = 0) => process.exit(code));

async function aggregateStats(profiles) {
  await graphService.initialize(db);
  await Promise.mapSeries(profiles, profile => {
    const graph = graphService.get(profile.cohortId);
    if (!graph) return Promise.resolve();
    const leafNodes = graph.getLeafNodes();
    return Promise.map(leafNodes, node => profile.aggregateStats(node));
  });
  return Promise.mapSeries(profiles, profile => profile.save());
}
