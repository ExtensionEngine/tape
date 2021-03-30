'use strict';

const chunk = require('lodash/chunk');
const db = require('../common/database');
const graphService = require('../knowledge-graph/graph.service');
const Promise = require('bluebird');

const { LearnerProfile } = db;

const CHUNK_SIZE = 10;

LearnerProfile.findAll()
  .then(profiles => aggregateStats(profiles))
  .then(() => console.log("Learner's stats successfully aggregated"))
  .catch(err => console.error(err.message) || 1)
  .then((code = 0) => process.exit(code));

async function aggregateStats(profiles) {
  await graphService.initialize(db);
  return Promise.each(chunk(profiles, CHUNK_SIZE), profilesChunk => {
    return Promise.map(profilesChunk, async profile => {
      const graph = graphService.get(profile.cohortId);
      if (!graph) return Promise.resolve();
      const leafs = graph.getLeafNodes();
      await Promise.each(chunk(leafs, CHUNK_SIZE), leafsChunk => {
        return Promise.map(leafsChunk, node => profile.aggregateStats(node));
      });
      return profile.save();
    });
  });
}
