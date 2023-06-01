"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('sequelize'), Sequelize = _a.Sequelize, DataTypes = _a.DataTypes;
// Initialize Sequelize with SQLite
var sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../database/data/database.sqlite'
});
// Define the User model
var UserDAO = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
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
}, { tableName: 'user' });
UserDAO.create({
    user_id: "aaa",
    username: "aaa",
    created_at: new Date(),
    updated_at: new Date(),
});
exports.default = UserDAO;
