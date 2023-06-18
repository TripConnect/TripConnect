import { DataTypes } from 'sequelize';

const { sequelize } = require('./index');

const UserCredential = sequelize.define('Trip', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  tableName: 'trip',
  timestamps: false,
});

export default UserCredential;
