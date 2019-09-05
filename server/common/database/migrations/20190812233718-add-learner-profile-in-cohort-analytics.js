'use strict';

const TABLE_NAME = 'learner_profile';
const COLUMN_NAME = 'in_cohort_analytics';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },
  down: queryInterface => queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME)
};
