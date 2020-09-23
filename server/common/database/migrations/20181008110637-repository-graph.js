'use strict';

const TABLE_NAME = 'repository_graph';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(TABLE_NAME, {
      repositoryId: {
        type: Sequelize.INTEGER,
        field: 'repository_id',
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
      ['repository_id', 'cohort_id'],
      { type: 'primary key', name: 'repo_graph_pkey' }
    );
  },
  down: queryInterface => queryInterface.dropTable(TABLE_NAME)
};
