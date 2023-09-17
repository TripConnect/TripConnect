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
    defaultValue: DataTypes.NOW
  },
}, {
  tableName: 'user_conversation_list',
  timestamps: false,
});

UserConversationList.removeAttribute('id');

export default UserConversationList;
