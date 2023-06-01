import { DataTypes } from 'sequelize';

const { sequelize } = require('./index');

const UserCredential = sequelize.define('UserCredential', {
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
    tableName: 'user_credential',
    timestamps: false,
});

export default UserCredential;
