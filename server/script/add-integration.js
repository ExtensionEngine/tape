'use strict';

const { prompt } = require('inquirer');
const { Integration } = require('../common/database');
const inRange = require('lodash/inRange');
const set = require('lodash/set');

const noop = Function.prototype;
const notEmpty = input => input.length > 0;

// Disable Sequelize SQL logging.
set(Integration, 'sequelize.options.logging', noop);

const questions = [{
  type: 'string',
  name: 'name',
  message: 'Enter integration name:',
  validate: getValidator(Integration, 'name')
}];

prompt(questions)
  .then(data => console.log() || Integration.create(data))
  .then(i => console.log(`Integration created: ${i.name} \nToken: ${i.token}`))
  .catch(err => console.error(err.message) || 1)
  .then((code = 0) => process.exit(code));

function getValidator(Model, attribute) {
  return function validate(input) {
    const validator = Model.prototype.validators[attribute];
    if (!validator || !validator.len) {
      return notEmpty(input) || `"${attribute}" can not be empty`;
    }
    const [min, max] = validator.len;
    return inRange(input.length, min, max) ||
      `"${attribute}" must be between ${min} and ${max} characters long`;
  };
}
