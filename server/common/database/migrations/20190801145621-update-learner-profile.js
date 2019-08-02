'use strict';

const TABLE_NAME = 'learner_profile';
const COLUMN_NAME = 'excluded';

module.exports = {
  up: (QI, Sequelize) => QI.addColumn(TABLE_NAME, COLUMN_NAME, {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }),
  down: (QI, _) => QI.removeColumn(TABLE_NAME, COLUMN_NAME)
};
