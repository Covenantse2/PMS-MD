// Import necessary modules
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const masterDataController = require('../controllers/masterdataController');

// Route to add master data
router.post('/addData', masterDataController.createMasterData);

// Route to delete master data
router.delete('/delete/:id', async (req, res) => {
    const masterId = req.params.id;

    try {
        const result = await db.query('DELETE FROM final_module WHERE MD_ID = ?', [masterId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Master Data not found' });
        }

        res.json({ message: 'Master Data deleted successfully' });
    } catch (error) {
        console.error('Database delete error:', error);
        res.status(500).send('Server error');
    }
});

// Route to get distinct modules
router.get('/get-modules', async (req, res) => {
    try {
        const rows = await db.query('SELECT DISTINCT Module FROM final_module');

        if (rows.length > 0) {
            res.json(rows.map(row => ({ Module: row.Module })));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// Route to get distinct sub-modules based on the module
router.get('/get-submodules/:module', async (req, res) => {
    const { module } = req.params;

    try {
        const rows = await db.query('SELECT DISTINCT Sub_Modue FROM final_module WHERE Module = ?', [module]);

        if (rows.length > 0) {
            res.json(rows.map(row => ({ Sub_Modue: row.Sub_Modue })));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching subModules:', error);
        res.status(500).json({ error: 'Failed to fetch subModules' });
    }
});

// Route to get distinct column names based on selected module and sub-module
router.get('/get-columnNames/:module/:subModule', async (req, res) => {
    const { module, subModule } = req.params;

    try {
        const rows = await db.query('SELECT DISTINCT Column_Name FROM final_module WHERE Module = ? AND Sub_Modue = ?', [module, subModule]);

        if (rows.length > 0) {
            res.json(rows.map(row => ({ Column_Name: row.Column_Name })));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching column names:', error);
        res.status(500).json({ error: 'Failed to fetch column names' });
    }
});

// Route to get distinct column descriptions based on the column name
router.get('/get-columnDescriptions/:columnName', async (req, res) => {
    const { columnName } = req.params;

    try {
        const rows = await db.query('SELECT DISTINCT Column_Description FROM final_module WHERE Column_Name = ?', [columnName]);

        if (rows.length > 0) {
            res.json(rows.map(row => ({ Column_Description: row.Column_Description })));
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching column descriptions:', error);
        res.status(500).json({ error: 'Failed to fetch column descriptions' });
    }
});

// Route to get filtered master data based on module, sub-module, column name, and column description
router.get('/get-masterdata', async (req, res) => {
    const { module, subModule, columnName, columnDescription } = req.query;

    let query = 'SELECT * FROM final_module WHERE 1=1'; // 1=1 is used to facilitate appending conditions dynamically
    const params = [];

    if (module) {
        query += ' AND Module = ?';
        params.push(module);
    }
    if (subModule) {
        query += ' AND Sub_Modue = ?';
        params.push(subModule);
    }
    if (columnName) {
        query += ' AND Column_Name = ?';
        params.push(columnName);
    }
    if (columnDescription) {
        query += ' AND Column_Description = ?';
        params.push(columnDescription);
    }

    try {
        const rows = await db.query(query, params);

        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching master data:', error);
        res.status(500).json({ error: 'Failed to fetch master data' });
    }
});

module.exports = router;
