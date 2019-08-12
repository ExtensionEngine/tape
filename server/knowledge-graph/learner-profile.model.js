'use strict';

const clamp = require('lodash/clamp');
const filter = require('lodash/filter');
const get = require('lodash/get');
const graphService = require('./graph.service');
const map = require('lodash/map');
const meanBy = require('lodash/meanBy');
const { Model } = require('sequelize');
const pick = require('lodash/pick');
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

  findOrCreateNode(nodeId) {
    if (!this.state[nodeId]) this.state[nodeId] = {};
    return this.state[nodeId];
  }

  getNodeState(nodeId) {
    return {
      ...get(this.state, nodeId, {}),
      progress: this.getProgress(nodeId),
      duration: this.getDuration(nodeId)
    };
  }

  updateProgress(nodeId, progress, date) {
    const graph = graphService.get(this.cohortId);
    const node = graph.get(nodeId);
    if (!node) throw new Error('Node does not exist within cohort graph!');
    progress = clamp(progress, 0, 100);
    const state = this.findOrCreateNode(nodeId);
    state.progress = state.progress > progress ? state.progress : progress;
    if (date) {
      state.startDate = state.startDate || date;
      state.lastSession = date;
      if (state.progress === 100 && !state.completedAt) state.completedAt = date;
    }
    const parents = graph.getParents(node);
    // If leaf node, aggregate up (parent nodes)
    if (parents.length) {
      parents.forEach(it => this.aggregateProgress(it, date));
      return;
    }
    // If root node, aggregate accross all repositories
    const rootNodes = graph.getRootNodes();
    this.progress = meanBy(rootNodes, ({ id }) => this.getProgress(id));
    const { repositoryId } = node;
    const repoRootNodes = filter(rootNodes, { repositoryId });
    const repoProgress = meanBy(repoRootNodes, ({ id }) => this.getProgress(id));
    if (!this.repoState[repositoryId]) {
      this.repoState[repositoryId] = { id: repositoryId };
    }
    Object.assign(this.repoState[repositoryId], {
      progress: repoProgress,
      lastSession: date
    });
    this.changed('state', true);
    this.changed('repoState', true);
    graphService.updateCohortProgress(this.cohortId);
  }

  updateDuration(nodeId, duration) {
    const { cohortId } = this;
    const graph = graphService.get(cohortId);
    const node = graph.get(nodeId);
    if (!node) throw new Error('Node does not exist within cohort graph!');
    const parents = graph.getParents(node);
    // if leaf node, calc duration and aggregate up
    if (!get(node, '_c.length')) {
      const columns = ['userId', 'cohortId', 'activityId'];
      const opts = {
        where: { ...pick(this, ['userId', 'cohortId']), activityId: nodeId },
        group: columns,
        attributes: [
          ...columns,
          [this.sequelize.fn('sum', this.sequelize.col('duration')), 'duration']
        ]
      };
      const UngradedEvent = this.sequelize.model('UngradedEvent');
      return UngradedEvent.findOne(opts)
        .then(event => this.set(`state.${nodeId}.duration`, event.duration))
        .then(() => parents.forEach(it => this.aggregateDuration(it)));
    }
    this.set(`state.${nodeId}.duration`, duration);
    if (parents.length) return parents.forEach(it => this.aggregateDuration(it));
    const rootNodes = graph.getRootNodes();
    const { repositoryId } = node;
    const repoRootNodes = filter(rootNodes, { repositoryId });
    const repoDuration = sumBy(repoRootNodes, ({ id }) => this.getDuration(id));
    this.set(`repoState.${repositoryId}.duration`, repoDuration);
  }

  aggregateDuration(node) {
    const duration = sumBy(node._c, id => this.getDuration(id));
    return this.updateDuration(node.id, duration);
  }

  aggregateProgress(node, timestamp) {
    const progress = meanBy(node._c, id => this.getProgress(id));
    return this.updateProgress(node.id, progress, timestamp);
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
