'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const user_id = uuidv4();
    const username = "foo";
    const password = "bar";
    const salt = await bcrypt.genSalt(12);
    const credential = await bcrypt.hash(password, salt);

    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.bulkInsert('user', [{
          user_id,
          username,
          created_at: new Date(),
          updated_at: new Date(),
        }]),
        queryInterface.bulkInsert('user_credential', [{
          user_id,
          credential,
        }]),
      ])
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.bulkDelete('user', null, {}),
        queryInterface.bulkDelete('user_credential', null, {}),
      ]);
    });
  }
};
