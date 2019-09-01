'use strict';

const TABLE_NAME = 'learner_profile';
const COLUMN_NAME = 'duration';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },
  down: queryInterface => queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME)
};
