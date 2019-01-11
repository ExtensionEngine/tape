const clamp = require('lodash/clamp');
const filter = require('lodash/filter');
const get = require('lodash/get');
const keyBy = require('lodash/keyBy');
const map = require('lodash/map');
const mean = require('lodash/mean');
const pick = require('lodash/pick');
const set = require('lodash/set');
const reduce = require('lodash/reduce');

class Graph {
  constructor(nodes = []) {
    nodes = reduce(nodes, (acc, it) => acc.concat(processNode(it)), []);
    attachChildren(nodes);
    this.nodes = keyBy(nodes, 'id');
  }

  get(id) {
    return this.nodes[id];
  }

  getParents(node) {
    const parents = get(node, '_p', []);
    return parents.map(id => this.get(id));
  }

  getChildren(node) {
    const children = get(node, '_c', []);
    return children.map(id => this.get(id));
  }

  static merge(graphs = []) {
    const graph = new Graph();
    graph.nodes = Object.assign({}, ...map(graphs, 'nodes'));
    return graph;
  }
}

class StateGraph {
  constructor(graph, state) {
    this.graph = graph;
    this.state = state;
  }

  getProgress(nodeId) {
    return get(this.state, `${nodeId}.progress`, 0);
  }

  setProgress(nodeId, progress) {
    const { graph, state } = this;
    const node = graph.get(nodeId);
    set(state[node.id], 'progress', clamp(progress, 0, 100));
    const parents = graph.getParents(node);
    if (parents.length) parents.forEach(it => this._aggregateProgress(it));
  }

  _aggregateProgress(node) {
    const childrenState = node._c.map(id => this.getProgress(id));
    this.setProgress(node.id, mean(childrenState));
  }

  getState() {
    return map(this.graph.nodes, node => ({
      ...pick(node, ['id']),
      progress: this.getProgress(node.id)
    }));
  }
}

function processNode(node) {
  const content = get(node, 'content', []);
  const exams = map(get(node, 'exams', []), it => ({ ...it, type: 'EXAM' }));
  return [
    node,
    ...attachParent(content, node.id),
    ...attachParent(exams, node.id)
  ].map(node => ({
    ...pick(node, ['id', 'type']),
    _p: map(filter(node.relationships, { type: 'PARENT' }), 'id')
  }));
}

function attachParent(nodes, parentId) {
  return nodes.map(it => ({
    ...it,
    relationships: [{ id: parentId, type: 'PARENT' }]
  }));
}

function attachChildren(nodes) {
  return nodes.forEach(node => {
    node._c = map(filter(nodes, it => it._p.includes(node.id)), 'id');
  });
}

module.exports = {
  Graph,
  StateGraph
};
