const isString = require('lodash/isString');
const mapValues = require('lodash/mapValues');
const Sequelize = require('sequelize');

const dbColumn = val => Sequelize.col(val);

function parsePath(path, Model) {
  if (!path.includes('.')) return [path];
  const [alias, ...columns] = path.split('.');
  const { target: model } = Model.associations[alias];
  return [{ model, as: alias }, ...parsePath(columns.join('.'), model)];
}

const sqlFunctions = {
  min: 'MIN',
  max: 'MAX',
  average: 'AVG',
  count: 'COUNT',
  distinct: 'DISTINCT'
};

module.exports = {
  dbColumn,
  parsePath,
  ...mapValues(sqlFunctions, buildSqlFunc)
};

function buildSqlFunc(name) {
  return col => Sequelize.fn(name, isString(col) ? dbColumn(col) : col);
}
