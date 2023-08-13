import { DataTypes } from 'sequelize';

import db from '.';

const UserConversationList = db.sequelize.define('UserConversationList', {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  join_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
}, {
  tableName: 'user_conversation_list',
  timestamps: false,
});

export default UserConversationList;
