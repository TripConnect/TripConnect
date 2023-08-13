import { DataTypes } from 'sequelize';

import db from '.';

const Conversation = db.sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  tableName: 'conversation',
  timestamps: false,
});

export default Conversation;
