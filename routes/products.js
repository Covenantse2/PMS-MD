const express = require('express');
const router = express.Router();
const db = require('../models/db'); 

// Route to fetch all service types
router.get('/service-types', async (req, res) => {
    try {
        const query = `SELECT Column_Description FROM final_module WHERE Column_Name = 'Service Type'`;
        const results = await db.query(query); // MariaDB returns the results directly as an array

        res.json(results); // Send the results as a JSON response
    } catch (error) {
        console.error('Error fetching service types:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to add a new product
router.post('/add', async (req, res) => {
    const { STD, AMT } = req.body;

    try {
        const query = `INSERT INTO products (Service_Type, Amount) VALUES (?, ?)`;
        const values = [STD, AMT];
        const result = await db.query(query, values);
        const resultString = JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ); // MariaDB returns the result as an array

        console.log("Insert Result: ", resultString);

        res.redirect('/ADMIN/products.html'); // Redirect to the products page or any other appropriate page
    } catch (error) {
        console.error('Error inserting product:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to fetch products, optionally filtering by service type
router.get('/getProducts', async (req, res) => {
    const { serviceType } = req.query; // Get the serviceType from query parameters
    let query = 'SELECT * FROM products';
    const values = [];

    if (serviceType) {
        query += ' WHERE Service_Type = ?';
        values.push(serviceType);
    }

    try {
        const results = await db.query(query, values); // MariaDB returns the results as an array
        res.json(results);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to delete a product by ID
router.delete('/delete/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const result = await db.query('DELETE FROM products WHERE PT_ID = ?', [productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
