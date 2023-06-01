import { DataTypes } from 'sequelize';

const { sequelize } = require('./index');

const User = sequelize.define('User', {
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
