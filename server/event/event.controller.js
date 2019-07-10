const db = require('../common/database');
const HttpStatus = require('http-status');
const map = require('lodash/map');
const pick = require('lodash/pick');
const set = require('lodash/set');

const { GradedEvent, LearnerProfile, UngradedEvent, Sequelize, utils } = db;
const { CREATED } = HttpStatus;
const { Op } = Sequelize;
const commonAttrs = ['userId', 'activityId', 'interactionStart', 'interactionEnd'];
const ungradedAttrs = ['progress'].concat(commonAttrs);
const gradedAttrs = ['questionId', 'isCorrect', 'answer'].concat(commonAttrs);
const ungradedFilterAttrs = ['fromDate', 'toDate', 'activityIds'];
const gradedFilterAttrs = ungradedFilterAttrs.concat('questionIds');

function listUngradedEvents({ cohortId, query, options }, res) {
  const fn = utils.build(UngradedEvent);
  const group = [fn.column('activityId')];
  const views = query.uniqueViews ? fn.distinct('userId') : fn.column('userId');
  const attributes = [
    [...group, 'activityId'],
    [fn.count(views), 'views'],
    [fn.average('duration'), 'avgDuration'],
    [fn.max('interactionEnd'), 'lastViewed']
  ];
  const where = getFilters({ cohortId, ...pick(query, ungradedFilterAttrs) });
  const opts = { where, ...options, group, attributes, raw: true };
  return UngradedEvent.findAndCountAll(opts).then(({ rows, count }) => {
    const items = map(rows, parseResult);
    return res.jsend.success(({ items, total: count.length }));
  });
}

function listGradedEvents({ cohortId, query, options }, res) {
  const fn = utils.build(GradedEvent);
  const group = [fn.column('questionId'), fn.column('activityId')];
  const attributes = [
    [fn.column('questionId'), 'questionId'],
    [fn.column('activityId'), 'activityId'],
    [fn.sum(Sequelize.cast(fn.column('isCorrect'), 'integer')), 'correct'],
    [fn.count(fn.column('userId')), 'submissions'],
    [fn.average('duration'), 'avgDuration'],
    [fn.max('interactionEnd'), 'lastSubmitted']
  ];
  const where = getFilters({ cohortId, ...pick(query, gradedFilterAttrs) });
  const opts = { where, ...options, group, attributes, raw: true };
  return GradedEvent.findAndCountAll(opts).then(({ rows, count }) => {
    const items = map(rows, parseResult);
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

function parseResult(it) {
  const intAttributes = ['views', 'submissions', 'correct'];
  return Object.keys(it).reduce((acc, key) => {
    if (key === 'avgDuration') return set(acc, key, parseFloat(it[key]));
    if (intAttributes.includes(key)) return set(acc, key, parseInt(it[key], 10));
    return set(acc, key, it[key]);
  }, {});
}

function getFilters(query) {
  const { activityIds, cohortId, fromDate, toDate, questionIds } = query;
  const where = { cohortId };
  if (fromDate) where.interactionStart = { [Op.gte]: fromDate };
  if (toDate) where.interactionEnd = { [Op.lte]: toDate };
  if (activityIds) where.activityId = { [Op.in]: activityIds };
  if (questionIds) where.questionId = { [Op.in]: questionIds };
  return where;
}

function calculateDuration({ interactionStart, interactionEnd }) {
  if (!interactionStart || !interactionEnd) return null;
  return Math.ceil((interactionEnd - interactionStart) / 1000);
}
