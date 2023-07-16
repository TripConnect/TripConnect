'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
    ];
    const userCredentials = await Promise.all(
      users.map(async ({ user_id, password }) => {
        const salt = await bcrypt.genSalt(12);
        const credential = await bcrypt.hash(password, salt);
        return { user_id, credential };
      })
    );

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
        queryInterface.bulkDelete('user', null, {}),
        queryInterface.bulkDelete('user_credential', null, {}),
      ]);
    });
  }
};
