'use strict';

const TABLE_NAME = 'learner_profile';
const COLUMN_NAME = 'duration';

module.exports = {
  up: (QI, Sequelize) => QI.addColumn(TABLE_NAME, COLUMN_NAME, {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }),
  down: (QI, _) => QI.removeColumn(TABLE_NAME, COLUMN_NAME)
};
