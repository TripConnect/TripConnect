import { DataTypes } from 'sequelize';

const { sequelize } = require('./index');

const UserCredential = sequelize.define('UserCredential', {
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    credential: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'user_credential',
    timestamps: false,
});

export default UserCredential;
