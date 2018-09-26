'use strict';

const { createError } = require('../common/errors');
const { User, Integration, Sequelize } = require('../common/database');
const HttpStatus = require('http-status');
const map = require('lodash/map');
const pick = require('lodash/pick');

const { EmptyResultError, Op } = Sequelize;
const { BAD_REQUEST, FORBIDDEN, NOT_FOUND } = HttpStatus;
const inputAttrs = ['email', 'role', 'firstName', 'lastName'];

function list({ query: { email, emailLike, role } }, res) {
  const cond = [{ role: { [Op.ne]: Integration.role } }];
  if (email) cond.push({ email });
  if (emailLike) cond.push({ email: { [Op.iLike]: `%${emailLike}%` } });
  if (role) cond.push({ role });
  return User.findAll({ where: { [Op.and]: cond } })
    .then(users => res.jsend.success(map(users, 'profile')));
}

function create(req, res) {
  const { body } = req;
  const origin = req.origin();
  return User.findOne({ where: { email: body.email }, rejectOnEmpty: true })
    .then(() => createError(FORBIDDEN, 'User already exists!'))
    .catch(EmptyResultError, () => User.invite(pick(body, inputAttrs), { origin }))
    .then(user => res.jsend.success(user.profile));
}

function patch({ params, body }, res) {
  return User.findById(params.id, { paranoid: false, rejectOnEmpty: true })
    .catch(EmptyResultError, () => createError(NOT_FOUND, 'User does not exist!'))
    .then(user => user.update(pick(body, inputAttrs)))
    .then(user => res.jsend.success(user.profile));
}

function login({ body }, res) {
  const { email, password } = body;
  if (!email || !password) {
    return createError(BAD_REQUEST, 'Please enter email and password!');
  }

  return User.find({ where: { email }, rejectOnEmpty: true })
    .catch(EmptyResultError, () => createError(NOT_FOUND, 'User does not exist!'))
    .then(user => user.authenticate(password))
    .then(user => user || createError(NOT_FOUND, 'Wrong password!'))
    .then(user => {
      const token = user.createToken({ expiresIn: '5 days' });
      res.jsend.success({ token, user: user.profile });
    });
}

function forgotPassword(req, res) {
  const { email } = req.body;
  const origin = req.origin();
  return User.find({ where: { email }, rejectOnEmpty: true })
    .catch(EmptyResultError, () => createError(NOT_FOUND, 'User not found!'))
    .then(user => user.sendResetToken({ origin }))
    .then(() => res.end());
}

function resetPassword({ body, params }, res) {
  const { password, token } = body;
  return User.find({ where: { token }, rejectOnEmpty: true })
    .catch(EmptyResultError, () => createError(NOT_FOUND, 'Invalid token!'))
    .then(user => {
      user.password = password;
      return user.save();
    })
    .then(() => res.end());
}

module.exports = {
  list,
  create,
  patch,
  login,
  forgotPassword,
  resetPassword
};
