'use strict';

const db = require('../index');
const graphService = require('../../../knowledge-graph/graph.service');
const Promise = require('bluebird');

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
    await Promise.map(profiles, profile => {
      const graph = graphService.get(profile.cohortId);
      const leafNodes = graph.getLeafNodes();
      return Promise.map(leafNodes, node => profile.aggregateStats(node, null));
    });
    return Promise.map(profiles, profile => profile.save());
  },
  down: (QI, _) => QI.removeColumn(TABLE_NAME, COLUMN_NAME)
};
