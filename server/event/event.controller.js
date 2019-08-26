const db = require('../common/database');
const get = require('lodash/get');
const HttpStatus = require('http-status');
const map = require('lodash/map');
const mapValues = require('lodash/mapValues');
const pick = require('lodash/pick');
const set = require('lodash/set');

const { GradedEvent, LearnerProfile, UngradedEvent, Sequelize, utils } = db;
const { CREATED } = HttpStatus;
const { Op } = Sequelize;
const commonAttrs = ['userId', 'activityId', 'interactionStart', 'interactionEnd'];
const ungradedAttrs = ['progress'].concat(commonAttrs);
const gradedAttrs = ['questionId', 'isCorrect', 'answer'].concat(commonAttrs);
const ungradedFilterAttrs = [
  'fromDate', 'toDate', 'activityIds', 'includeExcluded'
];
const gradedFilterAttrs = ungradedFilterAttrs.concat('questionIds');
const parser = {
  int: arg => parseInt(arg, 10),
  float: arg => parseFloat(arg)
};

const getAttrs = columns => map(columns, ({ val }, name) => [val, name]);
const parseResults = (columns, rows) => {
  return rows.map(row => mapValues(row, (value, column) => {
    const type = get(columns, `${column}.type`);
    return type ? parser[type](value) : value;
  }));
};

function listUngradedEvents(req, res) {
  const { cohortId, query, options } = req;
  const fn = utils.build(UngradedEvent);
  const group = [fn.column('activityId')];
  const columns = {
    activityId: { val: fn.column('activityId') },
    views: { val: fn.count(fn.column('userId')), type: 'int' },
    avgDuration: { val: fn.average('duration'), type: 'float' },
    lastViewed: { val: fn.max('interactionEnd') }
  };
  if (query.uniqueViews) {
    const uniqueViews = { val: fn.count(fn.distinct('userId')), type: 'int' };
    set(columns, 'uniqueViews', uniqueViews);
  }
  const opts = { ...options, group, attributes: getAttrs(columns), raw: true };
  return getFilters({ cohortId, ...pick(query, ungradedFilterAttrs) })
    .then(where => UngradedEvent.findAndCountAll({ where, ...opts }))
    .then(({ rows, count }) => {
      const items = parseResults(columns, rows);
      return res.jsend.success(({ items, total: count.length }));
    });
}

function listGradedEvents({ cohortId, query, options }, res) {
  const fn = utils.build(GradedEvent);
  const group = [fn.column('questionId'), fn.column('activityId')];
  const columns = {
    questionId: { val: fn.column('questionId') },
    activityId: { val: fn.column('activityId') },
    submissions: { val: fn.count(fn.column('userId')), type: 'int' },
    avgDuration: { val: fn.average('duration'), type: 'float' },
    lastSubmitted: { val: fn.max('interactionEnd') },
    correct: {
      val: fn.sum(Sequelize.cast(fn.column('isCorrect'), 'integer')),
      type: 'int'
    }
  };
  const opts = { ...options, group, attributes: getAttrs(columns), raw: true };
  return getFilters({ cohortId, ...pick(query, gradedFilterAttrs) })
    .then(where => GradedEvent.findAndCountAll({ where, ...opts }))
    .then(({ rows, count }) => {
      const items = parseResults(columns, rows);
      return res.jsend.success(({ items, total: count.length }));
    });
}

async function reportUngradedEvent({ cohortId, body }, res) {
  const data = { cohortId, ...pick(body, ungradedAttrs) };
  const profileCond = { cohortId, userId: body.userId };
  const [profile] = await LearnerProfile.findOrCreate({ where: profileCond });
  await UngradedEvent.create({ ...data, duration: calculateDuration(body) });
  profile.updateProgress(body.activityId, body.progress, new Date().getTime());
  await profile.save();
  return res.status(CREATED).end();
}

async function reportGradedEvent({ cohortId, body }, res) {
  const data = { cohortId, ...pick(body, gradedAttrs) };
  await GradedEvent.create({ ...data, duration: calculateDuration(body) });
  return res.status(CREATED).end();
}

module.exports = {
  listUngradedEvents,
  listGradedEvents,
  reportUngradedEvent,
  reportGradedEvent
};

async function getFilters(query) {
  const {
    activityIds, cohortId, fromDate, toDate, questionIds, includeExcluded
  } = query;
  const cond = { cohortId };
  if (fromDate) cond.interactionStart = { [Op.gte]: fromDate };
  if (toDate) cond.interactionEnd = { [Op.lte]: toDate };
  if (activityIds) cond.activityId = { [Op.in]: activityIds };
  if (questionIds) cond.questionId = { [Op.in]: questionIds };
  if (!includeExcluded) {
    cond.userId = { [Op.notIn]: await LearnerProfile.getExcludedUserIds(cohortId) };
  }
  return cond;
}

function calculateDuration({ interactionStart, interactionEnd }) {
  if (!interactionStart || !interactionEnd) return null;
  return Math.ceil((interactionEnd - interactionStart) / 1000);
}
