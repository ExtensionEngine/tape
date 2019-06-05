'use strict';

const TABLE_NAME = 'learner_profile';

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
      progress: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        allowNull: false
      },
      state: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      repoState: {
        type: Sequelize.JSONB,
        field: 'repo_state',
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.fn('NOW'),
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
      { type: 'primary key', name: 'learner_profile_pkey' }
    );
  },
  down: (queryInterface) => queryInterface.dropTable(TABLE_NAME)
};
