'use strict';

const { Model } = require('sequelize');

class KnowledgeGraph extends Model {
  static fields(DataTypes) {
    return {
      repositoryId: {
        type: DataTypes.INTEGER,
        field: 'repository_id',
        allowNull: false
      },
      cohortId: {
        type: DataTypes.SMALLINT,
        field: 'cohort_id',
        allowNull: false
      },
      nodes: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      }
    };
  }

  static options() {
    return {
      tableName: 'knowledge_graph',
      timestamps: true,
      freezeTableName: true
    };
  }
}

module.exports = KnowledgeGraph;
