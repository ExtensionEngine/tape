'use strict';

const { createError } = require('../errors');
const HttpStatus = require('http-status');
const role = require('../../../common/config/role');

const { UNAUTHORIZED } = HttpStatus;

function permit(...allowed) {
  allowed.push(role.ADMIN);
  return ({ user }, res, next) => {
    if (user && allowed.includes(user.role)) return next();
    return createError(UNAUTHORIZED, 'Access restricted');
  };
}

module.exports = {
  permit
};
