'use strict';

const TABLE_NAME = 'repository_graph';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(TABLE_NAME, {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
  }),
  down: (queryInterface) => queryInterface.dropTable(TABLE_NAME)
};
