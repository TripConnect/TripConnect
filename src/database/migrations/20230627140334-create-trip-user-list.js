'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable(
        'trip_user_list',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          trip_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          joined_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        {
          timestamps: false // Disable createdAt and updatedAt fields
        }
      )
      .then(() => queryInterface.addConstraint('trip_user_list', {
        fields: ['user_id'],
        type: 'FOREIGN KEY',
        name: 'FK_tripUserList_userId', // useful if using queryInterface.removeConstraint
        references: {
          table: 'user',
          field: 'user_id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }))
      .then(() => queryInterface.addConstraint('trip_user_list', {
        fields: ['trip_id'],
        type: 'FOREIGN KEY',
        name: 'FK_tripUserList_tripId', // useful if using queryInterface.removeConstraint
        references: {
          table: 'trip',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('trip_user_lists');
  }
};
