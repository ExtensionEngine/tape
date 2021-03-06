'use strict';

const clamp = require('lodash/clamp');
const filter = require('lodash/filter');
const get = require('lodash/get');
const graphService = require('./graph.service');
const map = require('lodash/map');
const max = require('lodash/max');
const meanBy = require('lodash/meanBy');
const { Model } = require('sequelize');
const pick = require('lodash/pick');
const Promise = require('bluebird');
const sumBy = require('lodash/sumBy');
const toArray = require('lodash/toArray');

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
      progress: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      state: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: false
      },
      repoState: {
        type: DataTypes.JSONB,
        field: 'repo_state',
        defaultValue: {},
        allowNull: false
      },
      inCohortAnalytics: {
        type: DataTypes.BOOLEAN,
        field: 'in_cohort_analytics',
        defaultValue: true
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

  getDuration(nodeId) {
    return get(this.state, `${nodeId}.duration`, 0);
  }

  getNodeState(nodeId) {
    return {
      ...get(this.state, nodeId, {}),
      progress: this.getProgress(nodeId),
      duration: this.getDuration(nodeId)
    };
  }

  async updateState(nodeId, stats) {
    const graph = graphService.get(this.cohortId);
    const node = graph.get(nodeId);
    if (!node) throw new Error('Node does not exist within cohort graph!');
    // if leaf node calc duration from UngradedEvents
    if (!get(node, '_c.length')) {
      stats.duration = await this.calculateDuration(nodeId);
    }
    this._setState(nodeId, stats);
    const parents = graph.getParents(node);
    if (parents.length) {
      return map(parents, it => this.aggregateStats(it, stats.date));
    }
    this._updateRepoState(graph, node);
    this.changed('state', true);
    this.changed('repoState', true);
    if (this.inCohortAnalytics) graphService.updateCohortProgress(this.cohortId);
    return Promise.resolve(this);
  }

  _updateRepoState(graph, node) {
    const rootNodes = graph.getRootNodes();
    const { repositoryId } = node;
    const repoRootNodes = filter(rootNodes, { repositoryId });
    this.progress = meanBy(rootNodes, ({ id }) => this.getProgress(id));
    this.duration = sumBy(rootNodes, ({ id }) => this.getDuration(id));
    const repoRootStates = map(repoRootNodes, it => this.getNodeState(it.id));
    const progress = meanBy(repoRootStates, 'progress');
    const duration = sumBy(repoRootStates, 'duration');
    const lastSession = max(map(repoRootStates, 'lastSession'));
    const state = get(this, `repoState.${repositoryId}`, { id: repositoryId });
    Object.assign(state, { progress, duration, lastSession });
    this.set(`repoState.${repositoryId}`, state);
  }

  _setState(nodeId, { progress, date, duration }) {
    const state = get(this, `state.${nodeId}`, {});
    progress = clamp(progress, 0, 100);
    state.progress = max([state.progress, progress]);
    state.duration = duration;
    if (date) {
      state.startDate = state.startDate || date;
      state.lastSession = date;
      if (state.progress === 100 && !state.completedAt) state.completedAt = date;
    }
    this.set(`state.${nodeId}`, state);
  }

  async calculateDuration(nodeId) {
    const UngradedEvent = this.sequelize.model('UngradedEvent');
    const where = { ...pick(this, ['userId', 'cohortId']), activityId: nodeId };
    return UngradedEvent.aggregate('duration', 'sum', { where })
      .then(duration => duration || 0);
  }

  aggregateStats(node, timestamp) {
    const duration = sumBy(node._c, id => this.getDuration(id));
    const progress = meanBy(node._c, id => this.getProgress(id));
    return this.updateState(node.id, { progress, duration, date: timestamp });
  }

  getGraph() {
    const graph = graphService.get(this.cohortId);
    if (!graph) return;
    const nodes = map(graph.nodes, node => ({
      ...pick(node, ['id']),
      ...this.getNodeState(node.id)
    }));
    return { repositories: toArray(this.repoState), nodes };
  }

  static getRuledOutFromAnalytics(cohortId, options) {
    const where = { inCohortAnalytics: false, cohortId };
    return this.findAll({ where, ...options });
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
