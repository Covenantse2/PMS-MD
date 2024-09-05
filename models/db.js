const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,           // Allows waiting for connections if the pool is busy
    connectionLimit: 10,                // Maximum number of connections in the pool
    queueLimit: 0 
});

module.exports = pool;


async function fetchData() {
  let conn;
  try {
    conn = await pool;
    const rows = await conn.query('SELECT * FROM users where role="admin"');
    console.log('Query results:', rows);
  } catch (err) {
    console.error('Error executing query:', err);
  }
}

fetchData();