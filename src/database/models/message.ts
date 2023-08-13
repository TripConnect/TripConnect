import { DataTypes } from 'sequelize';

import db from '.';

const Message = db.sequelize.define('Message', {
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  from_user_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  to_user_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  state: {
    type: DataTypes.ENUM,
    values: ['sent', 'seen', 'revoked'],
  }

}, {
  tableName: 'message',
  timestamps: false,
});

export default Message;
