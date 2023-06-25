'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable(
        'user_credential',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          user_id: {
            allowNull: false,
            unique: true,
            type: Sequelize.STRING
          },
          credential: {
            allowNull: false,
            type: Sequelize.STRING
          },
        },
        {
          timestamps: false // Disable createdAt and updatedAt fields
        }
      )
      .then(() => queryInterface.addConstraint('user_credential', {
        fields: ['user_id'],
        type: 'FOREIGN KEY',
        name: 'FK_userId_user', // useful if using queryInterface.removeConstraint
        references: {
          table: 'user',
          field: 'user_id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_credential');
  }
};