const express = require('express');
const multer = require('multer');
const db = require('../models/db');
const router = express.Router();
const path = require('path');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Save to 'uploads/' folder
    },
    filename: function (req, file, cb) {
        const companyId = req.body.CMID; // 'CMID' is the name of the company ID field in your form
        const documentType = req.body.DCT; // 'DCT' is the name of the document type field in your form

        if (!companyId || !documentType) {
            return cb(new Error('Missing required fields'), null);
        }

        // Generate a readable timestamp in YYYYMMDD-HHMMSS format
        const now = new Date();
        const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

        // Generate filename with format: companyId_documentType_YYYYMMDD-HHMMSS.ext
        const ext = path.extname(file.originalname); // Extract file extension
        const filename = `${companyId}_${documentType}_${formattedDate}${ext}`;

        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// Table View code

router.get('/documents', async (req, res) => {
    try {
        const sql = `
            SELECT 
                 
                Account_Owner , 
                Company_Id , 
                Company_Name , 
                Service_Type , 
                Document_Type , 
                Document_Name , 
                Document_URL  
            FROM customer_documents`;

        // Use await with the query method
        const [results] = await db.query(sql);

        res.json(results);
    } catch (error) {
        console.error('Error fetching customer documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// Fetch distinct account owners from the customer table
router.get('/getAccountOwners', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT DISTINCT Account_Owner FROM customer`);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching account owners:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to fetch Company IDs
// router.get('/getAccountOwners', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT DISTINCT Account_Owner FROM customer');
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching account owners:', error);
//         res.status(500).json({ error: 'Database error' });
//     }
// });

// // Route to get company names based on the selected account owner
// router.get('/getCompanyName', async (req, res) => {
//     const { accountOwner } = req.query; // Use req.query to retrieve query parameters

//     try {
//         // Check if accountOwner is provided
//         if (!accountOwner) {
//             return res.status(400).json({ error: 'Account owner is required' });
//         }

//         const [rows] = await db.query(
//             'SELECT DISTINCT Company_name FROM customer WHERE Account_Owner = ?',
//             [accountOwner]
//         );

//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching company names:', error);
//         res.status(500).json({ error: 'Database error' });
//     }
// });


router.get('/getAccountOwners', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DISTINCT Account_Owner FROM customer`);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching account owners:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/getCompanyIdsByOwner', async (req, res) => {
    const { accountOwner } = req.query;

    try {
        const [rows] = await db.query(`
            SELECT DISTINCT Company_Id FROM customer WHERE Account_Owner = ?`, [accountOwner]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching company IDs:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/getCompanyNameById', async (req, res) => {
    const { companyId } = req.query;

    try {
        const [rows] = await db.query(`
            SELECT Company_Name FROM customer WHERE Company_Id = ?`, [companyId]);
        res.json(rows[0]); // Return the first row
    } catch (error) {
        console.error('Error fetching company name:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to fetch Document Types
router.get('/getDocumentTypes', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT Column_Description FROM final_module WHERE Column_Name = 'Document Type'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
router.get('/getServiceType', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT Column_Description FROM final_module WHERE Column_Name = 'Service Type'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    }
});



router.post('/upload', upload.single('DURL'), async (req, res) => {
    const { ANTO, CMID, CMN,SCT, DCT, DOCN } = req.body;
    const documentUrl = req.file ? req.file.filename : null;

    try {
        // Insert document data into the database
        const query = `
            INSERT INTO customer_documents (Account_Owner, Company_ID, Company_Name,Document_Type,Service_Type, Document_Name, Document_URL) 
            VALUES (?, ?, ?, ?, ?, ?,?)`;
        const values = [ANTO, CMID, CMN, DCT,SCT, DOCN, documentUrl];
        const [result] = await db.query(query, values);

        console.log("Insert Result: ", JSON.stringify(result));
        
        res.redirect('../ADMIN/cutomerdocuments.html'); // Redirect after successful upload
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.delete('/delete/:id', async(req, res) => {
    const docID = req.params.id;

    // SQL query to delete the customer
    try {
        const result = await db.query('DELETE FROM customer_documents WHERE CD_ID = ?', [docID]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'document not found' });
        }
        res.json({ message: 'document deleted successfully' });
    } catch (error) {
        console.error('Database delete error:', error);
        res.status(500).send('Server error');   
    }
});
module.exports = router;
