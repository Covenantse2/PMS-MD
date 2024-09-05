const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const taskController = require('../controllers/taskController');
const db = require('../models/db')

// Configure multer for file uploads
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

// Route to add a task
router.post('/add', upload.single('DURL'), taskController.addTask);
router.get('/getTask', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query('SELECT * FROM assign_task');
        res.json(rows);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});
router.delete('/owndelete/:id', async (req, res) => {
    let conn;
    const taskId = req.params.id;
    try {
        conn = await db.getConnection();
        const result = await conn.query('DELETE FROM assign_task WHERE AT_ID = ?', [taskId]);
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


// Route to get tasks
router.get('/get-executives', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        // Fetch distinct executives from the groups table, with backticks around the table name
        const rows = await conn.query(`
            SELECT DISTINCT Select_Employee AS name 
            FROM \`groups\` 
            WHERE Select_Employee IS NOT NULL
        `);

        res.json(rows);
    } catch (err) {
        console.error('SQL error:', err.sqlMessage || err); // Log the specific SQL error message
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});

router.get('/edit/:id', async (req, res) => {
    const assignId = req.params.id;
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await pool.query('SELECT * FROM assign_task WHERE AT_ID = ?', [assignId]);
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
    const updatedCompany = req.body;

    console.log('Received data:', updatedCompany); // Debugging: Log incoming data

    const updateQuery = `
        UPDATE assign_task
        SET 
            Executive_Name = ?, Company_Id = ?, Company_Name = ?, Document_Type = ?, Document_Name = ?, Doument_URL = ?, 
            Task_Name = ?, Task_Details = ?, Status = ?, Remarks = ?
        WHERE 
            AT_ID  = ?
    `;

    const values = [
        updatedCompany.Executive_Name, updatedCompany.Company_Id, updatedCompany.Company_Name, updatedCompany.Document_Type, 
        updatedCompany.Document_Name, updatedCompany.Doument_URL, updatedCompany.Task_Name, updatedCompany.Task_Details, 
        updatedCompany.Remarks, updatedCompany.Status ,assignId
    ];

    console.log('Update values:', values); // Debugging: Log the values being passed to the query
    let conn;
    try {
        conn = await db.getConnection();
        const result = await conn.query(updateQuery, values);
        console.log('Query result:', result); // Debugging: Log the result of the query
        res.status(200).send('task details updated successfully');
    } catch (error) {
        console.error('Error updating task details:', error);
        res.status(500).send('Failed to update task details');
    }finally {
        if (conn) conn.end();
    }
});

router.get('/designations', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query(`
             SELECT DISTINCT Department_Desigination 
            FROM employee 
            WHERE Department_Desigination = 'Executive'
        `);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});

router.get('/getAccountOwners', async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        // Query to get distinct Account Owner values
        const accountOwners = await conn.query(
            `SELECT DISTINCT Account_Owner FROM customer_documents`
        );

        if (accountOwners.length === 0) {
            return res.status(404).send('No account owners found');
        }

        res.json(accountOwners);
    } catch (error) {
        console.error('Error fetching account owners:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});
router.get('/getCompanyNames', async (req, res) => {
    const { accountOwner } = req.query; // Get the account owner from the query string
    let conn;

    if (!accountOwner) {
        return res.status(400).send('Account Owner is required');
    }

    try {
        conn = await db.getConnection();
        // Query to get Company Names based on the selected Account Owner
        const companyNames = await conn.query(
            `SELECT DISTINCT Company_Name FROM customer_documents WHERE Account_Owner = ?`,
            [accountOwner]
        );

        if (companyNames.length === 0) {
            return res.status(404).send('No company names found for the selected account owner');
        }

        res.json(companyNames);
    } catch (error) {
        console.error('Error fetching company names:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});

router.get('/getCompanyID', async (req, res) => {
    const { companyName } = req.query; // Get the company name from the query string
    let conn;

    if (!companyName) {
        return res.status(400).send('Company Name is required');
    }

    try {
        conn = await db.getConnection();
        // Query to get Company ID based on the selected Company Name
        const companyInfo = await conn.query(
            `SELECT DISTINCT Company_Id FROM customer_documents WHERE Company_Name = ?`,
            [companyName]
        );

        if (companyInfo.length === 0) {
            return res.status(404).send('No company ID found for the selected company name');
        }

        res.json(companyInfo[0]);
    } catch (error) {
        console.error('Error fetching company ID:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});

router.get('/getServiceTypes', async (req, res) => {
    const { companyName } = req.query;
    let conn;

    if (!companyName) {
        return res.status(400).send('Company Name is required');
    }

    try {
        conn = await db.getConnection();
        const serviceTypes = await conn.query(
            `SELECT DISTINCT Service_Type FROM customer_documents WHERE Company_Name = ?`,
            [companyName]
        );

        if (serviceTypes.length === 0) {
            return res.status(404).send('No service types found for the selected company name');
        }

        // Return service types as an array
        res.json(serviceTypes);
    } catch (error) {
        console.error('Error fetching service types:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});
router.get('/getDocumentTypes', async (req, res) => {
    const { companyName } = req.query;
    let conn;

    if (!companyName) {
        return res.status(400).send('Company Name is required');
    }

    try {
        conn = await db.getConnection();
        const documentTypes = await conn.query(
            `SELECT DISTINCT Document_Type FROM customer_documents WHERE Company_Name = ?`,
            [companyName]
        );

        if (documentTypes.length === 0) {
            return res.status(404).send('No document types found for the selected company name');
        }

        // Return document types as an array
        res.json(documentTypes);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});

router.get('/getDocumentNames', async (req, res) => {
    const { companyName } = req.query;
    let conn;

    if (!companyName) {
        return res.status(400).send('Company Name is required');
    }

    try {
        conn = await db.getConnection();
        const documentNames = await conn.query(
            `SELECT DISTINCT Document_Name FROM customer_documents WHERE Company_Name = ?`,
            [companyName]
        );

        if (documentNames.length === 0) {
            return res.status(404).send('No document names found for the selected company name');
        }

        // Return document names as an array
        res.json(documentNames);
    } catch (error) {
        console.error('Error fetching document names:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});
router.get('/getDocumentUrl', async (req, res) => {
    const { documentName } = req.query;
    let conn;

    try {
        conn = await db.getConnection();
        const results = await conn.query(
            'SELECT Document_URL FROM customer_documents WHERE Document_Name = ?',
            [documentName]
        );

        if (results.length > 0) {
            res.json({ Document_URL: results[0].Document_URL });
        } else {
            res.status(404).json({ Document_URL: null });
        }
    } catch (error) {
        console.error('Error fetching document URL:', error);
        res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }
});
module.exports = router;
