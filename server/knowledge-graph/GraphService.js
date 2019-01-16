const filter = require('lodash/filter');
const find = require('lodash/find');
const get = require('lodash/get');
const Graph = require('./Graph');
const map = require('lodash/map');
const Promise = require('bluebird');
const removeBy = require('lodash/remove');

class GraphService {
  constructor() {
    this.graphs = [];
    this.cohortGraphs = {};
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
    const graph = new Graph(nodes);
    const existing = this.get(cohortId, repositoryId);
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

  _onChange(cohortId) {
    const graphs = map(filter(this.graphs, { cohortId }), 'graph');
    this.cohortGraphs[cohortId] = Graph.merge(graphs);
  }
}

module.exports = new GraphService();
