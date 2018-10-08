'use strict';

const { Model } = require('sequelize');

class UngradedEvent extends Model {
  static fields(DataTypes) {
    return {
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        allowNull: false
      },
      cohortId: {
        type: DataTypes.SMALLINT,
        field: 'cohort_id',
        allowNull: false
      },
      activityId: {
        type: DataTypes.INTEGER,
        field: 'activity_id',
        allowNull: false
      },
      progress: {
        type: DataTypes.TINYINT,
        defaultValue: 100,
        allowNull: false
      },
      interactionStart: {
        type: DataTypes.DATE,
        field: 'interaction_start'
      },
      interactionEnd: {
        type: DataTypes.DATE,
        field: 'interaction_end'
      },
      duration: {
        type: DataTypes.SMALLINT
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      }
    };
  }

  static options() {
    return {
      tableName: 'ungraded_event',
      timestamps: true,
      freezeTableName: true
    };
  }
}

module.exports = UngradedEvent;
