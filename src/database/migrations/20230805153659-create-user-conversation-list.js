'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable('user_conversation_list', {
        user_id: {
          type: Sequelize.STRING
        },
        conversation_id: {
          type: Sequelize.INTEGER
        },
        join_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
      })
      .then(() => queryInterface.addConstraint("user_conversation_list", {
        fields: ['user_id'],
        type: 'FOREIGN KEY',
        name: 'FK_userConversationList_userId', // useful if using queryInterface.removeConstraint
        references: {
          table: 'user',
          field: 'user_id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }))
      .then(() => queryInterface.addConstraint("user_conversation_list", {
        fields: ['conversation_id'],
        type: 'FOREIGN KEY',
        name: 'FK_userConversationList_conversationId', // useful if using queryInterface.removeConstraint
        references: {
          table: 'conversation',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_conversation_list');
  }
};