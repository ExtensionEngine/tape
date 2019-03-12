'use strict';

function parseNumericParam(req, _, next, value, name) {
  req[name] = parseInt(value, 10);
  next();
}

module.exports = {
  parseNumericParam
};
