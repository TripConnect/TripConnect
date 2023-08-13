'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'message',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        content: {
          allowNull: false,
          type: Sequelize.STRING
        },
        state: {
          allowNull: false,
          type: Sequelize.ENUM('sent', 'seen', 'revoked')
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        from_user_id: {
          allowNull: false,
          type: Sequelize.STRING
        },
        to_user_id: {
          allowNull: false,
          type: Sequelize.STRING
        }
      },
      {
        timestamps: false // Disable createdAt and updatedAt fields
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('message');
  }
};