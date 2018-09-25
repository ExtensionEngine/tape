'use strict';

module.exports = {
  alterEnum
};

// NOTE: Enables safe altering of ENUM values:
//       https://github.com/sequelize/sequelize/issues/7151#issuecomment-380429781
function alterEnum(queryInterface, Sequelize, table, column, options = {}) {
  const { QueryGenerator, sequelize } = queryInterface;
  const str = { type: Sequelize.STRING, allowNull: false };
  return queryInterface.changeColumn(table, column, str)
    .then(() => sequelize.query(QueryGenerator.pgEnumDrop(table, column)))
    .then(() => queryInterface.changeColumn(table, column, options));
}
