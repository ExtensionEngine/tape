'use strict';

const clamp = require('lodash/clamp');
const get = require('lodash/get');
const graphService = require('./GraphService');
const map = require('lodash/map');
const mean = require('lodash/mean');
const { Model } = require('sequelize');
const pick = require('lodash/pick');
const set = require('lodash/set');

class LearnerProfile extends Model {
  static fields(DataTypes) {
    return {
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        primaryKey: true,
        unique: 'learner_profile_pkey'
      },
      cohortId: {
        type: DataTypes.SMALLINT,
        field: 'cohort_id',
        primaryKey: true,
        unique: 'learner_profile_pkey'
      },
      state: {
        type: DataTypes.JSONB,
        defaultValue: {},
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

  getProgress(nodeId) {
    return get(this.state, `${nodeId}.progress`, 0);
  }

  getNodeState(nodeId) {
    return {
      ...get(this.state, nodeId, {}),
      progress: this.getProgress(nodeId)
    };
  }

  updateProgress(nodeId, progress) {
    const graph = graphService.get(this.cohortId);
    const node = graph.get(nodeId);
    if (!node) throw new Error('Node does not exist within cohort graph!');
    const timestamp = new Date().getTime();
    if (!this.state[node.id]) set(this.state, `${node.id}.startDate`, timestamp);
    set(this.state, `${node.id}.progress`, clamp(progress, 0, 100));
    set(this.state, `${node.id}.lastSession`, timestamp);
    const parents = graph.getParents(node);
    if (parents.length) parents.forEach(it => this.aggregateProgress(it));
    this.changed('state', true);
  }

  aggregateProgress(node) {
    const childrenState = node._c.map(id => this.getProgress(id));
    return this.updateProgress(node.id, mean(childrenState));
  }

  async getProfile() {
    const graph = await graphService.get(this.cohortId);
    return map(graph.nodes, node => ({
      ...pick(node, ['id']),
      ...this.getNodeState(node.id)
    }));
  }

  static options() {
    return {
      tableName: 'learner_profile',
      timestamps: true,
      paranoid: true,
      freezeTableName: true
    };
  }
}

module.exports = LearnerProfile;
