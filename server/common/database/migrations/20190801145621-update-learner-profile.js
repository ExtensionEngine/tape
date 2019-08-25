'use strict';

const TABLE_NAME = 'learner_profile';
const COLUMN_NAME = 'excluded';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },
  down: queryInterface => queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME)
};
