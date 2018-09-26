'use strict';

const { getValidator } = require('../common/database/helpers');
const { prompt } = require('inquirer');
const { Integration } = require('../common/database');
const set = require('lodash/set');

const noop = Function.prototype;

// Disable Sequelize SQL logging.
set(Integration, 'sequelize.options.logging', noop);

const questions = [{
  type: 'input',
  name: 'name',
  message: 'Enter integration name:',
  validate: getValidator(Integration, 'name')
}];

prompt(questions)
  .then(data => console.log() || Integration.create(data))
  .then(integration => {
    console.log(`Integration created: ${integration.email}`);
    console.log(`Token: ${integration.token}`);
  })
  .catch(err => console.error(err.message) || 1)
  .then((code = 0) => process.exit(code));
