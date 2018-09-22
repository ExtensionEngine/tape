'use strict';

require('dotenv').config();
const log = require('../../common/logger');
const logger = log('db', { level: log.DEBUG });

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  url: process.env.DATABASE_URI,
  dialect: 'postgres',
  operatorsAliases: false,
  migrationStorageTableName: 'sequelize_meta',
  benchmark: !isProduction,
  logging(query, time) {
    const info = { query };
    if (time) info.duration = `${time}ms`;
    return logger.debug(info);
  }
};
