import { DataTypes } from 'sequelize';

import db from '.';

const User = db.sequelize.define('User', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    tableName: 'user',
    timestamps: false,
});

export default User;
