'use strict';

const TABLE_NAME = 'graded_event';

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
    questionId: {
      type: Sequelize.INTEGER,
      field: 'question_id',
      allowNull: false
    },
    isCorrect: {
      type: Sequelize.BOOLEAN,
      field: 'is_correct',
      allowNull: false
    },
    answer: {
      type: Sequelize.JSONB,
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
