const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../models/db'); // Updated to use the 'pool' from mariadb
const companyController = require('../controllers/companyController');

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

// Route for adding a company
router.post('/add', upload.single('Company_Logo'), companyController.addCompany);

// Route for fetching all companies
router.get('/get', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM company');
        res.json(rows);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});

// Route for deleting a company by ID
router.delete('/:id', async (req, res) => {
    const companyId = req.params.id;
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM company WHERE CM_ID = ?', [companyId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error('Database delete error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching a company by ID
router.get('/edit/:id', async (req, res) => {
    const companyId = req.params.id;
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM company WHERE CM_ID = ?', [companyId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});

// Route for updating a company by ID
router.put('/putEdit/:companyId', async (req, sres) => {
    const companyId = req.params.companyId;
    const updatedCompany = req.body;

    const updateQuery = `
        UPDATE company
        SET 
            Company_Name = ?, Company_Accid = ?, Phone = ?, Email = ?, Website = ?, Fax = ?, 
            Numberof_Employees = ?, Annual_Revenue = ?, Skype_Id = ?, Gst_Vat = ?, 
            Business_Pan = ?, Enable_Tax = ?, Enable_Tds = ?, Bank_Name = ?, Branch_Name = ?, 
            Crn_Id = ?, Account_No = ?, Ifsc_Code = ?, Door_No = ?, Street = ?, City = ?, 
            State = ?, Zipcode = ?, Country = ?, Description = ?, Company_Logo = ? 
        WHERE 
            CM_ID  = ?
    `;

    const values = [
        updatedCompany.Company_Name, updatedCompany.Company_Accid, updatedCompany.Phone, updatedCompany.Email, 
        updatedCompany.Website, updatedCompany.Fax, updatedCompany.Numberof_Employees, updatedCompany.Annual_Revenue, 
        updatedCompany.Skype_Id, updatedCompany.Gst_Vat, updatedCompany.Business_Pan, updatedCompany.Enable_Tax, 
        updatedCompany.Enable_Tds, updatedCompany.Bank_Name, updatedCompany.Branch_Name, updatedCompany.Crn_Id, 
        updatedCompany.Account_No, updatedCompany.Ifsc_Code, updatedCompany.Door_No, updatedCompany.Street, 
        updatedCompany.City, updatedCompany.State, updatedCompany.Zipcode, updatedCompany.Country, 
        updatedCompany.Description, updatedCompany.Company_Logo, companyId
    ];

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(updateQuery, values);
        res.redirect('/ADMIN/company.html');
    } catch (error) {
        console.error('Error updating company details:', error);
        res.status(500).send('Failed to update company details');
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Annual Revenue' options
router.get('/getAulRev', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Company' AND Column_Name = 'Annual Revenue'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Enable TAX' options
router.get('/getEtax', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Company' AND Column_Name = 'Enable TAX'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Enable TDS' options
router.get('/getEtds', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Company' AND Column_Name = 'Enable TDS'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

module.exports = router;
