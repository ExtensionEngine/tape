'use strict';

const now = new Date();

const graphs = [{
  repository_id: 1,
  cohort_id: 1,
  nodes: JSON.stringify([{
    id: 1,
    name: 'Competency 1',
    type: 'COMPETENCY',
    exams: [{ id: 100 }, { id: 101 }]
  }, {
    id: 2,
    name: 'Competency 2',
    type: 'COMPETENCY',
    exams: [{ id: 102 }, { id: 103 }]
  }, {
    id: 3,
    type: 'LEARNING_OBJECTIVE',
    name: 'Learning Objective 1',
    relationships: [{ id: 1, type: 'PARENT' }]
  }, {
    id: 4,
    type: 'LEARNING_OBJECTIVE',
    name: 'Learning Objective 2',
    relationships: [{ id: 1, type: 'PARENT' }]
  }, {
    id: 5,
    type: 'LEARNING_OBJECTIVE',
    name: 'Learning Objective 3',
    relationships: [{ id: 2, type: 'PARENT' }]
  }, {
    id: 6,
    type: 'LEARNING_OBJECTIVE',
    name: 'Learning Objective 4',
    relationships: [{ id: 2, type: 'PARENT' }]
  }, {
    id: 7,
    type: 'LESSON',
    name: 'Lesson 1',
    relationships: [{ id: 3, type: 'PARENT' }],
    content: [{ id: 50, type: 'PAGE' }],
    assessments: [{ id: 200 }, { id: 201 }, { id: 202 }]
  }, {
    id: 8,
    type: 'LESSON',
    name: 'Lesson 2',
    relationships: [{ id: 3, type: 'PARENT' }],
    content: [{ id: 51, type: 'PAGE' }],
    assessments: [{ id: 203 }, { id: 204 }, { id: 205 }]
  }, {
    id: 9,
    type: 'LESSON',
    name: 'Lesson 3',
    relationships: [{ id: 4, type: 'PARENT' }],
    content: [{ id: 52, type: 'PAGE' }],
    assessments: [{ id: 206 }, { id: 207 }, { id: 208 }]
  }, {
    id: 10,
    type: 'LESSON',
    name: 'Lesson 4',
    relationships: [{ id: 4, type: 'PARENT' }],
    content: [{ id: 53, type: 'PAGE' }],
    assessments: [{ id: 209 }, { id: 210 }, { id: 211 }]
  }, {
    id: 11,
    type: 'LESSON',
    name: 'Lesson 5',
    relationships: [{ id: 5, type: 'PARENT' }],
    content: [{ id: 54, type: 'PAGE' }],
    assessments: [{ id: 212 }, { id: 213 }, { id: 214 }]
  }, {
    id: 12,
    type: 'LESSON',
    name: 'Lesson 6',
    relationships: [{ id: 5, type: 'PARENT' }],
    content: [{ id: 55, type: 'PAGE' }],
    assessments: [{ id: 215 }, { id: 216 }, { id: 217 }]
  }, {
    id: 13,
    type: 'LESSON',
    name: 'Lesson 7',
    relationships: [{ id: 6, type: 'PARENT' }],
    content: [{ id: 56, type: 'PAGE' }],
    assessments: [{ id: 218 }, { id: 219 }, { id: 220 }]
  }, {
    id: 14,
    type: 'LESSON',
    name: 'Lesson 8',
    relationships: [{ id: 6, type: 'PARENT' }],
    content: [{ id: 57, type: 'PAGE' }],
    assessments: [{ id: 221 }, { id: 222 }, { id: 223 }]
  }]),
  created_at: now,
  updated_at: now
}];

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('knowledge_graph', graphs);
  },
  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('knowledge_graph');
  }
};
