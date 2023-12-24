'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable(
        'conversation',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          name: {
            type: Sequelize.STRING
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE
          }
        },
        {
          timestamps: false // Disable createdAt and updatedAt fields
        }
      )
      .then(() =>
        queryInterface.addColumn("message", "conversation_id", { type: Sequelize.INTEGER })
      )
      .then(() => queryInterface.addConstraint('message', {
        fields: ['conversation_id'],
        type: 'FOREIGN KEY',
        name: 'FK_message_conversationId', // useful if using queryInterface.removeConstraint
        references: {
          table: 'conversation',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }))

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('message');
    await queryInterface.dropTable('conversation');
  }
};