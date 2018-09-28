'use strict';

const { getValidator, setLogging } = require('../common/database/helpers');
const { Integration } = require('../common/database');
const { prompt } = require('inquirer');
const isEmail = require('is-email-like');

setLogging(Integration, false);

const defaultDomain = domain => input => {
  if (input.includes('@')) return input;
  return `${input}@${domain}`;
};
const line = (char = '-', length = Math.min(process.stdout.columns, 80)) => {
  let result = '';
  while (length) {
    result += char;
    length--;
  }
  return result;
};

const template = (integration, token = false) => `
# ${integration.name}
${line()}
Id:    ${integration.id}
Email: ${integration.email}
${(token && `Token: ${integration.token}\n`) || ''}`;

const commands = {
  list,
  create,
  token: getToken,
  default: list
};
const action = commands[process.argv[2]] || commands.default;

action()
  .catch(err => console.error(err.message) || 1)
  .then((code = 0) => process.exit(code));

function list() {
  return Integration.findAll({ where: { role: Integration.role } })
    .then(integrations => {
      console.log(integrations.map(it => template(it).trim()).join('\n\n'));
      console.log();
    });
}

function create() {
  const question = {
    type: 'input',
    name: 'name',
    message: 'Enter integration name:',
    validate: getValidator(Integration, 'name')
  };
  return prompt([question])
    .then(({ name }) => Integration.create({ name }))
    .then(integration => console.log(template(integration, true)));
}

function getToken() {
  const question = {
    type: 'input',
    name: 'email',
    message: 'Enter integration email:',
    validate: isEmail,
    filter: defaultDomain('integration.localhost')
  };
  return prompt([question])
    .then(({ email }) => {
      email = email.trim().toLowerCase();
      return Promise.all([
        Integration.findOne({ where: { email, role: Integration.role } }),
        email
      ]);
    })
    .then(([integration, email]) => {
      if (integration) return console.log(template(integration, true));
      return Promise.reject(new Error(`Integration "${email}" does not exist.`));
    });
}
