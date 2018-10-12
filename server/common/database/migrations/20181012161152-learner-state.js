'use strict';

const TABLE_NAME = 'learner_state';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(TABLE_NAME, {
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
      nodes: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        field: 'deleted_at'
      }
    });
    await queryInterface.addConstraint(
      TABLE_NAME,
      ['user_id', 'cohort_id'],
      { type: 'primary key', name: 'learner_state_pkey' }
    );
  },
  down: (queryInterface) => queryInterface.dropTable(TABLE_NAME)
};
