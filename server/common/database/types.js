'use strict';

const { DataTypes } = require('sequelize');
const inherits = require('sequelize/lib/utils/inherits');

const { warn } = DataTypes.ABSTRACT;
const POSTGRES_DOCS_URL = 'http://www.postgresql.org/docs/9.4/static/datatype.html';

module.exports = DataTypes;

// NOTE: Implementation taken from: https://git.io/fxC9Y
function TINYINT(length) {
  if (!(this instanceof TINYINT)) return new TINYINT(length);
  DataTypes.TINYINT.apply(this, arguments);
  // POSTGRES does not support any parameters for tinyint
  if (this._length || this.options.length || this._unsigned || this._zerofill) {
    warn(POSTGRES_DOCS_URL, 'PostgreSQL does not support TINYINT with options. Plain `TINYINT` will be used instead.');
    this._length = undefined;
    this.options.length = undefined;
    this._unsigned = undefined;
    this._zerofill = undefined;
  }
}
inherits(TINYINT, DataTypes.TINYINT);
define(DataTypes.postgres, TINYINT);

function define(dialect, Type, key = Type.key) {
  Type.key = key;
  if (!Type.extend) Type.extend = base => new Type(base.options);
  Object.assign(dialect, { [Type.key]: Type });
  return Type;
}
