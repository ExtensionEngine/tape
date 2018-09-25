'use strict';

const { alterEnum } = require('../helpers');
const { role } = require('../../../../common/config');
const values = require('lodash/values');

const roles = values(role);

module.exports = {
  up(queryInterface, Sequelize) {
    return alterEnum(queryInterface, Sequelize, 'user', 'role', {
      type: Sequelize.ENUM([...roles, 'INTEGRATION']),
      allowNull: false
    });
  },
  down(queryInterface, Sequelize) {
    return alterEnum(queryInterface, Sequelize, 'user', 'role', {
      type: Sequelize.ENUM(roles),
      allowNull: false
    });
  }
};
