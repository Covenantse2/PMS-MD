const db = require('./db');

const addTask = async (taskData) => {
    const {
         companyName, taskName, file, remarks, status, description
    } = taskData;

    const [result] = await db.query(
        `INSERT INTO executiveTask ( companyName, taskName, file, remarks, status, description) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [ companyName, taskName, file, remarks, status, description]
    );

    return result;
};

module.exports = { addTask };
