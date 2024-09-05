const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../models/db'); // Updated to use the 'pool' from mariadb
const customerController = require('../controllers/customerController');

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

// Route for adding a customer
router.post('/add', customerController.addCustomer);

// Route for fetching all customers
router.get('/get', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM customer');
        res.json(rows);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});

// Route for deleting a customer by ID
router.delete('/:id', async (req, res) => {
    const customerId = req.params.id;
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM customer WHERE CUS_ID = ?', [customerId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Database delete error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching a customer by ID
router.get('/edit/:id', async (req, res) => {
    const customerId = req.params.id;
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM customer WHERE CUS_ID = ?', [customerId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});

router.put('/putEdit/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    const updatedCustomer = req.body;

    console.log('Received data:', updatedCustomer); // Debugging: Log incoming data

    const updateQuery = `
        UPDATE customer SET
            Account_Owner = ?, Account_Ratings = ?, Company_Id = ?, Company_Name = ?, 
            Parentcompany_Name = ?, Website = ?, Phone = ?, Fax = ?, Email = ?, 
            Accounts_Email = ?, Ceo_Name = ?, Ceo_Email = ?, Company_Type = ?, 
            Ownership = ?, Industry = ?, Employees = ?, Annual_Revenue = ?, 
            Expected_Revenue = ?, Primary_Contactname = ?, Secondary_Contactname = ?, 
            Primary_Phone = ?, Secondary_Phone = ?, Primary_Email = ?, 
            Secondary_Email = ?, Primary_Designation = ?, Secondary_Designation = ?, 
            Primary_Remarks = ?, Secondary_Remarks = ?, Bank_Accountno = ?, 
            Account_Holder = ?, Ifsc_Code = ?, Branch_Name = ?, Sic_Code = ?, 
            Tcs_Tds = ?, Company_Pan = ?, Gst_Vat = ?, Credit_Amountallowed = ?, 
            Credit_Age = ?, Billing_Street = ?, Billing_City = ?, Billing_State = ?, 
            Billing_Zipcode = ?, Billing_Country = ?, Shipping_Street = ?, 
            Shipping_City = ?, Shipping_State = ?, Shipping_Zipcode = ?, 
            Shipping_Country = ? 
        WHERE CUS_ID = ?
    `;

    const values = [
        updatedCustomer.Account_Owner, updatedCustomer.Account_Ratings, updatedCustomer.Company_Id, updatedCustomer.Company_Name, 
        updatedCustomer.Parentcompany_Name, updatedCustomer.Website, updatedCustomer.Phone, updatedCustomer.Fax, 
        updatedCustomer.Email, updatedCustomer.Accounts_Email, updatedCustomer.Ceo_Name, updatedCustomer.Ceo_Email, 
        updatedCustomer.Company_Type, updatedCustomer.Ownership, updatedCustomer.Industry, updatedCustomer.Employees, 
        updatedCustomer.Annual_Revenue, updatedCustomer.Expected_Revenue, updatedCustomer.Primary_Contactname, 
        updatedCustomer.Secondary_Contactname, updatedCustomer.Primary_Phone, updatedCustomer.Secondary_Phone, 
        updatedCustomer.Primary_Email, updatedCustomer.Secondary_Email, updatedCustomer.Primary_Designation, 
        updatedCustomer.Secondary_Designation, updatedCustomer.Primary_Remarks, updatedCustomer.Secondary_Remarks, 
        updatedCustomer.Bank_Accountno, updatedCustomer.Account_Holder, updatedCustomer.Ifsc_Code, 
        updatedCustomer.Branch_Name, updatedCustomer.Sic_Code, updatedCustomer.Tcs_Tds, updatedCustomer.Company_Pan, 
        updatedCustomer.Gst_Vat, updatedCustomer.Credit_Amountallowed, updatedCustomer.Credit_Age, 
        updatedCustomer.Billing_Street, updatedCustomer.Billing_City, updatedCustomer.Billing_State, 
        updatedCustomer.Billing_Zipcode, updatedCustomer.Billing_Country, updatedCustomer.Shipping_Street, 
        updatedCustomer.Shipping_City, updatedCustomer.Shipping_State, updatedCustomer.Shipping_Zipcode, 
        updatedCustomer.Shipping_Country, customerId
    ];

    console.log('Update values:', values); // Debugging: Log the values being passed to the query

    let conn;
    try {
        conn = await pool.getConnection();
        const [result] = await conn.query(updateQuery, values);
        console.log('Query result:', result); // Debugging: Log the result of the query
        res.redirect('/ADMIN/customers.html');
    } catch (error) {
        console.error('Error updating customer details:', error);
        res.status(500).send('Failed to update customer details');
    } finally {
        if (conn) conn.end();
    }
});

router.get('/getAccOwner', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Employee_Name FROM employee WHERE Department_Desigination='Team Lead'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching account owners:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Ratings' options
router.get('/getRating', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='Ratings'");
        res.json(rows);
        
    } catch (error) {
        console.error('Error fetching ratings:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Company Type' options
router.get('/getComType', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='Company Type'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching company types:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Ownership' options
router.get('/getOwner', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='Ownership'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching ownership types:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Industry' options
router.get('/getIndustry', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='Industry'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching industries:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Annual Revenue' options
router.get('/getAnRev', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='Annual Revenue'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching annual revenue:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Expected Revenue' options
router.get('/getExRev', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='Expected Revenue'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching expected revenue:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'Bank' options
router.get('/getPrimaryD', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='Primary Designation'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching bank details:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

// Route for fetching distinct 'PAN Number' options
router.get('/getSecondaryD', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='Secondary Designation'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching PAN numbers:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
router.get('/getTDS', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Customer' AND Column_Name='TCS TDS'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching PAN numbers:', error.message);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});


module.exports = router;
