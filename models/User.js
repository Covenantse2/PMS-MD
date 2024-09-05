const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

module.exports = {
    findOne: async (role, username, password) => {
        const [rows] = await promisePool.query(
            'SELECT * FROM users WHERE role = ? AND username = ? AND password = ?',
            [role, username, password]
        );
        return rows[0];
    },
};
