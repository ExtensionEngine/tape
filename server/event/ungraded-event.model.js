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
        type: DataTypes.SMALLINT,
        defaultValue: 100,
        allowNull: false,
        validate: { min: 0, max: 100 }
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
        type: DataTypes.SMALLINT,
        validate: { min: 1, max: 28800 }
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW
      }
    };
  }

  static options() {
    return {
      tableName: 'ungraded_event',
      timestamps: false,
      freezeTableName: true
    };
  }
}

module.exports = UngradedEvent;
