'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable(
        'trip',
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
          created_by: {
            type: Sequelize.STRING
          },
          created_at: {
            type: Sequelize.DATE
          },
          description: {
            type: Sequelize.STRING
          },
        },
        {
          timestamps: false // Disable createdAt and updatedAt fields
        }
      )
      .then(() => queryInterface.addConstraint('trip', {
        fields: ['created_by'],
        type: 'FOREIGN KEY',
        name: 'FK_trip_createdBy', // useful if using queryInterface.removeConstraint
        references: {
          table: 'user',
          field: 'user_id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('trip');
  }
};