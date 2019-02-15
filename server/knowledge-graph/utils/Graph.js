const filter = require('lodash/filter');
const get = require('lodash/get');
const keyBy = require('lodash/keyBy');
const map = require('lodash/map');
const pick = require('lodash/pick');
const reduce = require('lodash/reduce');

class Graph {
  constructor(repositoryId, nodes = []) {
    nodes = reduce(nodes, (acc, it) => acc.concat(processNode(it)), []);
    attachChildren(nodes);
    nodes.forEach(it => (it.repositoryId = repositoryId));
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

  getRootNodes() {
    return filter(this.nodes, it => !get(it, '_p', []).length);
  }

  static merge(graphs = []) {
    const graph = new Graph();
    graph.nodes = Object.assign({}, ...map(graphs, 'nodes'));
    return graph;
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

module.exports = Graph;
