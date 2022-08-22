const sequelize = require("sequelize");

module.exports = new sequelize (
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            timezone: '+06:00',
        },
        timezone: '+06:00',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
    })