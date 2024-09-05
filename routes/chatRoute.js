const express = require('express');
const router = express.Router();
const db = require('../models/db');  // Your DB connection

// Route to get all tasks from assign_task table
router.get('/tasks', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection(); // Get a connection from the pool
        const rows = await conn.query(`
            SELECT 
                AT_ID as TaskID, 
                Company_Name, 
                Service_Type, 
                Document_Type, 
                Task_Name, 
                Task_Details, 
                Status ,
                Created_DT
            FROM assign_task
        `);
        res.json(rows); // Return the rows as JSON
    } catch (error) {
        console.error('Database fetch error:', error); // Log the error for debugging
        res.status(500).send('Server error'); // Send a 500 error response if something goes wrong
    } finally {
        if (conn) conn.end(); // Ensure the connection is closed
    }
});

router.get('/task/:id', async (req, res) => {
    const taskId = req.params.id;
    let conn;

    try {
        conn = await db.getConnection(); // Get connection from the pool
        const rows = await conn.query(`
            SELECT 
                AT_ID as TaskID, 
                Company_Name, 
                Account_Owner, 
                Status, 
                Designation, 
                Executive_Name, 
                Service_Type, 
                Task_Name, 
                Created_DT
            FROM assign_task
            WHERE AT_ID = ?
        `, [taskId]);

        if (rows.length > 0) {
            res.json(rows[0]); // Return task details
        } else {
            res.status(404).send('Task not found');
        }
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end(); // Ensure the connection is closed
    }
});

module.exports = router;
