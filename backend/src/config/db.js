const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = process.env.DB_URL ? {
    uri: process.env.DB_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
} : {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rudra@2007',
    database: process.env.DB_NAME || 'gdg_cn',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(poolConfig);

module.exports = pool;
