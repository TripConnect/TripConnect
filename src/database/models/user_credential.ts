import { DataTypes } from 'sequelize';

import db from '.';

const UserCredential = db.sequelize.define('UserCredential', {
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
