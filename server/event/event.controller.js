const db = require('../common/database');
const HttpStatus = require('http-status');
const map = require('lodash/map');
const pick = require('lodash/pick');

const { GradedEvent, LearnerProfile, UngradedEvent, utils } = db;
const fn = utils.build(UngradedEvent);
const { CREATED } = HttpStatus;
const commonAttrs = ['userId', 'activityId', 'interactionStart', 'interactionEnd'];
const ungradedAttrs = ['progress'].concat(commonAttrs);
const gradedAttrs = ['questionId', 'isCorrect', 'answer'].concat(commonAttrs);

const parseResult = it => ({
  ...it,
  avgDuration: parseFloat(it.avgDuration),
  views: parseInt(it.views, 10)
});


function listUngradedEvents({ cohortId, query, options }, res) {
  const { activityIds, uniqueViews } = query;
  const group = [fn.column('activityId')];
  const views = uniqueViews ? fn.distinct('userId') : fn.column('userId');
  const attributes = [
    [...group, 'activityId'],
    [fn.count(views), 'views'],
    [fn.average('duration'), 'avgDuration'],
    [fn.max('interactionEnd'), 'lastViewed'],
  ];
  const where = { cohortId };
  if (activityIds) where.activityId = { [Op.in]: activityIds };
  const opts = { where, ...options, group, attributes, raw: true };
  return UngradedEvent.findAndCountAll(opts).then(({ rows, count }) => {
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

function calculateDuration({ interactionStart, interactionEnd }) {
  if (!interactionStart || !interactionEnd) return null;
  return Math.ceil((interactionEnd - interactionStart) / 1000);
}

module.exports = {
  listUngradedEvents,
  reportUngradedEvent,
  reportGradedEvent
};
