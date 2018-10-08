'use strict';

const { Model } = require('sequelize');

class GradedEvent extends Model {
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
      questionId: {
        type: DataTypes.INTEGER,
        field: 'question_id',
        allowNull: false
      },
      isCorrect: {
        type: DataTypes.BOOLEAN,
        field: 'is_correct',
        allowNull: false
      },
      answer: {
        type: DataTypes.JSONB,
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
        type: DataTypes.SMALLINT,
        validate: { min: 1, max: 28800 }
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      }
    };
  }

  static options() {
    return {
      tableName: 'graded_event',
      timestamps: true,
      freezeTableName: true
    };
  }
}

module.exports = GradedEvent;
