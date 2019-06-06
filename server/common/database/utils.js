'use strict';

const { Sequelize, Utils: { SequelizeMethod } } = require('sequelize');
const get = require('lodash/get');
const mapValues = require('lodash/mapValues');

const dbColumn = (col, Model) => {
  if (col instanceof SequelizeMethod) return col;
  const name = get(Model, `rawAttributes.${col}.field`, col);
  return Sequelize.col(name);
};

function parsePath(path, Model) {
  if (!path.includes('.')) return [dbColumn(path, Model)];
  const [alias, ...columns] = path.split('.');
  const { target: model } = Model.associations[alias];
  return [{ model, as: alias }, ...parsePath(columns.join('.'), model)];
}

const sqlFunctions = {
  min: 'MIN',
  max: 'MAX',
  average: 'AVG',
  count: 'COUNT',
  distinct: 'DISTINCT',
  sum: 'SUM'
};

module.exports = {
  parsePath,
  build: Model => ({
    column: (col, model) => dbColumn(col, model || Model),
    ...mapValues(sqlFunctions, it => buildSqlFunc(it, Model))
  })
};

function buildSqlFunc(name, Model) {
  return (col, model) => Sequelize.fn(name, dbColumn(col, model || Model));
}
