'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("conversation", "type", { type: Sequelize.ENUM("private", "group", "trip") })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("conversation", "type");
  }
};