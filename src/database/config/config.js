require('dotenv').config()

module.exports = {
    "development": {
        "username": process.env.DATEBASE_USERNAME,
        "password": process.env.DATEBASE_PASSWORD,
        "database": process.env.DATEBASE_NAME,
        "host": process.env.DATEBASE_ADDRESS,
        "dialect": "mysql"
    },
    "test": {
        "username": "root",
        "password": null,
        "database": "database_test",
        "host": "127.0.0.1",
        "dialect": "mysql"
    },
    "production": {
        "username": "root",
        "password": null,
        "database": "database_production",
        "host": "127.0.0.1",
        "dialect": "mysql"
    }
}