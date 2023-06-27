import { DataTypes } from 'sequelize';

import db from '.';

const TripUserList = db.sequelize.define('TripUserList', {
    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'trip_user_list',
    timestamps: false,
});

export default TripUserList;
