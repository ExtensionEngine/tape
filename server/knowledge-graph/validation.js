const Joi = require('joi');
const Promise = require('bluebird');

const validate = Promise.promisify(Joi.validate);

const id = Joi.number().integer().required();
const type = Joi.string().trim().min(2).required();
const relationship = Joi.object().keys({ id, type });
const content = Joi.object().keys({ id, type });
const exam = Joi.object().keys({ id });
const assessment = Joi.object().keys({ id });

const outlineNode = Joi.object().keys({
  id,
  name: Joi.string().trim(),
  type,
  relationships: Joi.array().items(relationship),
  content: Joi.array().items(content),
  exams: Joi.array().items(exam),
  assessments: Joi.array().items(assessment)
});

const graphSchema = Joi.object().keys({
  repositoryId: id,
  cohortId: id,
  nodes: Joi.array().items(outlineNode)
});

module.exports = data => validate(data, graphSchema);
