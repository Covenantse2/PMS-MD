const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const taskController = require('../controllers/extaskController');
const db = require('../models/db');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const currentDate = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        const originalName = file.originalname; // Original file name
        cb(null, `${currentDate}-${originalName}`);
    }
});

const upload = multer({ storage: storage });

// Define the route to handle the task form submission
router.post('/add1', upload.single('DURL1'), taskController.addTask);
router.get('/getTask1',taskController.getTasks)
router.get('/get-exe', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        // Fetch distinct executives from the groups table, with backticks around the table name
        const rows = await conn.query(`
            SELECT DISTINCT Select_Lead AS name 
            FROM \`groups\` 
            WHERE Select_Lead IS NOT NULL
        `);

        res.json(rows);
    } catch (err) {
        console.error('SQL error:', err.sqlMessage || err); // Log the specific SQL error message
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});



router.get('/get-comp', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query(`
            SELECT Company_Id AS id, Company_Name AS name FROM assign_task
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});

router.get('/get-doc-types', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query(`
            SELECT Column_Description AS name FROM final_module 
            WHERE Column_Name = 'Document Type'
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});
router.delete('/delete/:id', async (req, res) => {
    const taskId = req.params.AT_ID;
    let conn;
    try {
        conn = await db.getConnection();
        // Replace with your database query to delete the task
        const result = await conn.query('DELETE FROM assign_task WHERE AT_ID = ?', [taskId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }finally {
        if (conn) conn.end();
    }
});

router.delete('/delete1/:id', async (req, res) => {
    const taskId1 = req.params.id;
    let conn;
    try {
        conn = await db.getConnection();
        const result = await conn.query('DELETE FROM upload_task WHERE UT_ID = ?', [taskId1]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Database delete error:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});

router.get('/edit/:id', async (req, res) => {
    const uploadId = req.params.id;
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query('SELECT * FROM upload_task WHERE UT_ID  = ?', [uploadId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'task not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});

router.put('/putEdit/:assignId', async (req, res) => {
    const assignId = req.params.assignId;
    const updatedTask = req.body;

    console.log('Received data:', updatedTask); // Debugging: Log incoming data

    const updateQuery = `
        UPDATE upload_task
        SET 
            Executive_Name = ?, Company_Id = ?, Company_Name = ?, Document_Type = ?, Document_Name = ?, Doument_URL = ?, 
            Task_Name = ?, Task_Details = ?, Status = ?, Remarks = ?
        WHERE 
            UT_ID = ?
    `;

    const values = [
        updatedTask.Executive_Name, updatedTask.Company_Id, updatedTask.Company_Name, updatedTask.Document_Type, 
        updatedTask.Document_Name, updatedTask.Document_URL, updatedTask.Task_Name, updatedTask.Task_Details, 
        updatedTask.Status, updatedTask.Remarks, assignId
    ];

    console.log('Update values:', values); // Debugging: Log the values being passed to the query

    try {
        const result = await db.query(updateQuery, values);
        console.log('Query result:', result); // Debugging: Log the result of the query
        res.status(200).send('Task details updated successfully');
    } catch (error) {
        console.error('Error updating task details:', error);
        res.status(500).send('Failed to update task details');
    }
});
module.exports = router;
