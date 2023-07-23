'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const users = [
  {
    user_id: uuidv4(),
    display_name: "The gang racing boy",
    username: "tripconnectboy",
    password: "tripconnectboy",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    user_id: uuidv4(),
    display_name: "The gang racing girl",
    username: "tripconnectgirl",
    password: "tripconnectgirl",
    created_at: new Date(),
    updated_at: new Date(),
  },
  ...Array.from(Array(100).keys()).map(value => ({
    user_id: uuidv4(),
    display_name: `Seeding user ${value + 1}`,
    username: `seedinguser${value + 1}`,
    password: `seedinguser${value + 1}`,
    created_at: new Date(),
    updated_at: new Date(),
  }))
];
const userCredentials = users.map(({ user_id, password }) => {
  const salt = bcrypt.genSaltSync(12);
  const credential = bcrypt.hashSync(password, salt);
  return { user_id, credential };
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.bulkInsert('user', users.map(({ password, ...user }) => user)),
        queryInterface.bulkInsert('user_credential', userCredentials),
      ])
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.bulkDelete('user', { user_id: { [Op.in]: users.map(user => user.user_id) } }, {}),
        queryInterface.bulkDelete('user_credential', { user_id: { [Op.in]: users.map(user => user.user_id) } }, {}),
      ]);
    });
  }
};
