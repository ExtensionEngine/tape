'use strict';

const db = require('../index');
const graphService = require('../../../knowledge-graph/graph.service');
const mapValues = require('lodash/mapValues');
const omit = require('lodash/omit');
const Promise = require('bluebird');

const removeDuration = state => mapValues(state, it => omit(it, ['duration']));
const { LearnerProfile } = db;

const TABLE_NAME = 'learner_profile';
const COLUMN_NAME = 'duration';

module.exports = {
  up: async (QI, Sequelize) => {
    await QI.addColumn(TABLE_NAME, COLUMN_NAME, {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    const profiles = await LearnerProfile.findAll();
    await graphService.initialize(db);
    await Promise.mapSeries(profiles, profile => {
      const graph = graphService.get(profile.cohortId);
      const leafNodes = graph.getLeafNodes();
      return Promise.map(leafNodes, node => profile.aggregateStats(node));
    });
    return Promise.mapSeries(profiles, profile => profile.save());
  },
  down: async (QI, _) => {
    const profiles = await LearnerProfile.findAll();
    await Promise.mapSeries(profiles, profile => {
      const state = removeDuration(profile.state);
      const repoState = removeDuration(profile.repoState);
      profile.set('state', state);
      profile.set('repoState', repoState);
      return profile.save();
    });
    return QI.removeColumn(TABLE_NAME, COLUMN_NAME);
  }
};
