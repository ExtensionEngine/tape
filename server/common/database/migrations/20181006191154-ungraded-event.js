'use strict';

const TABLE_NAME = 'ungraded_event';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      field: 'user_id',
      allowNull: false
    },
    cohortId: {
      type: Sequelize.SMALLINT,
      field: 'cohort_id',
      allowNull: false
    },
    activityId: {
      type: Sequelize.INTEGER,
      field: 'activity_id',
      allowNull: false
    },
    progress: {
      type: Sequelize.SMALLINT,
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
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  }),
  down: (queryInterface) => queryInterface.dropTable(TABLE_NAME)
};
