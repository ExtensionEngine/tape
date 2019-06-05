'use strict';

const { email: config } = require('../config');
const { promisify } = require('util');
const email = require('emailjs');

const server = email.server.connect(config);
const send = promisify(server.send.bind(server));

module.exports = {
  send
};
