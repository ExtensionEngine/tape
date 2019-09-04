const filter = require('lodash/filter');
const find = require('lodash/find');
const get = require('lodash/get');
const Graph = require('./utils/Graph');
const map = require('lodash/map');
const Promise = require('bluebird');
const removeBy = require('lodash/remove');
const throttle = require('lodash/throttle');
const uniq = require('lodash/uniq');

class GraphService {
  constructor() {
    this.graphs = [];
    this.cohortGraphs = {};
    this.updateCohortProgress = this.throttle(this._updateCohortProgress, 10000);
    this.initialized = new Promise(resolve => {
      this.initialize = async db => {
        this.db = db;
        const graphs = await db.RepositoryGraph.findAll();
        graphs.forEach(it => this.add(it));
        resolve();
      };
    });
  }

  get(cohortId, repositoryId) {
    if (!repositoryId) return this.cohortGraphs[cohortId];
    return get(find(this.graphs, { cohortId, repositoryId }), 'graph');
  }

  add({ cohortId, repositoryId, nodes }) {
    const graph = new Graph(repositoryId, nodes);
    const existing = find(this.graphs, { cohortId, repositoryId });
    if (existing) {
      existing.graph = graph;
    } else {
      this.graphs.push({ cohortId, repositoryId, graph });
    }
    this._onChange(cohortId, repositoryId);
  }

  remove(cohortId, repositoryId) {
    removeBy(this.graphs, { cohortId, repositoryId });
    this._onChange(cohortId);
  }

  getCohortProgress(cohortId) {
    return get(this.cohortGraphs, `${cohortId}.progress`, 0);
  }

  async _updateCohortProgress(cohortId) {
    const { LearnerProfile } = this.db;
    const opts = { where: { cohortId, inCohortAnalytics: true } };
    const progress = await LearnerProfile.aggregate('progress', 'avg', opts);
    this.cohortGraphs[cohortId].progress = progress;
  }

  async _updateLearnersProgress(cohortId) {
    const { LearnerProfile } = this.db;
    const profiles = await LearnerProfile.findAll({ where: { cohortId } });
    const graph = this.get(cohortId);
    const leafs = graph.getLeafNodes();
    // Trigger aggregations for level above leafs
    // Will be propagated to parent nodes
    const targetNodeIds = uniq(map(leafs, '_p'));
    const targetNodes = map(targetNodeIds, id => graph.get(id));
    profiles.forEach(profile => {
      targetNodes.forEach(node => {
        profile.aggregateProgress(node);
      });
    });
    return Promise.map(profiles, it => it.save());
  }

  async _onChange(cohortId) {
    const graphs = map(filter(this.graphs, { cohortId }), 'graph');
    this.cohortGraphs[cohortId] = Graph.merge(graphs);
    await this._updateLearnersProgress(cohortId);
    this.updateCohortProgress(cohortId);
  }

  throttle(func, duration) {
    const _delays = {};
    return id => {
      if (!_delays[id]) {
        _delays[id] = throttle(() => func.call(this, id), duration);
      }
      _delays[id]();
    };
  }
}

module.exports = new GraphService();
