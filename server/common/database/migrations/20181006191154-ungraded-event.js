'use strict';

const TABLE_NAME = 'ungraded_event';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cohortId: {
      type: Sequelize.SMALLINT,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    activityId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    progress: {
      type: Sequelize.TINYINT,
      defaultValue: 100,
      allowNull: false
    },
    interactionStart: {
      type: Sequelize.DATE,
      field: 'interaction_start'
    },
    interactionEnd: {
      type: Sequelize.DATE,
      field: 'interaction_end'
    },
    duration: {
      type: Sequelize.SMALLINT
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
      allowNull: false
    }
  }),
  down: (queryInterface) => queryInterface.dropTable(TABLE_NAME)
};
