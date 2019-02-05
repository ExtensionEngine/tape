'use strict';

const { auth: config = {} } = require('../config');
const jwt = require('jsonwebtoken');
const { Model } = require('sequelize');
const pick = require('lodash/pick');

class Integration extends Model {
  static fields(DataTypes) {
    return {
      name: {
        type: DataTypes.STRING,
        field: 'name'
      },
      token: {
        type: DataTypes.STRING,
        validate: { notEmpty: true, len: [10, 500] }
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      }
    };
  }

  static options() {
    return {
      modelName: 'integration',
      timestamps: true,
      paranoid: true,
      freezeTableName: true
    };
  }

  static hooks() {
    return {
      afterCreate(integration) {
        return integration.setToken();
      }
    };
  }

  setToken(expiresIn = '100000 days') {
    this.token = this.createToken({ expiresIn });
    return this.save();
  }

  createToken(options = {}) {
    const payload = pick(this, ['id', 'name']);
    return jwt.sign(payload, config.secret, options);
  }
}

module.exports = Integration;
