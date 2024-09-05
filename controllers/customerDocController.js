// controllers/customerController.js

const db = require('../models/db');

exports.uploadCustomerDocument = async (req, res) => {
    const { CD_CN, CD_AN, CD_PN, CD_BN } = req.body;

    // Get file paths from uploaded files
    const aadharImage = req.files['CD_AI'] ? `/uploads/${req.files['CD_AI'][0].filename}` : null;
    const panImage = req.files['CD_PI'] ? `/uploads/${req.files['CD_PI'][0].filename}` : null;
    const bankPassbookImage = req.files['CD_BI'] ? `/uploads/${req.files['CD_BI'][0].filename}` : null;

    const Ip_Mac = Math.floor(Math.random() * 1000000000); // Random number for Ip_Mac
    const Created_DT = moment().format('YYYY-MM-DD'); // Current date
    const Lastupdated_DT = Created_DT;
    const Month_Year = moment().format('MM-YYYY');

    // Get Financial Year
    const getFinancialYearQuery = `SELECT Financial_Year FROM financial_year`;
    const [financialYearResults] = await db.query(getFinancialYearQuery);

    if (!financialYearResults.length) {
      return res.status(400).send('Financial Year not found');
    }

    const Financial_Year = financialYearResults[0].Financial_Year;

    try {
        const [result] = await db.query(
            `INSERT INTO customer_documents (Customer_Name, aadhar_no, aadhar_image_path, pan_no, pan_image_path, Bank_Accountno, bank_passbook_image_path,Ip_Mac,Financial_Year,Created_DT,Lastupdated_DT,Month_Year) 
            VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?,?)`,
            [CD_CN, CD_AN, aadharImage, CD_PN, panImage, CD_BN, bankPassbookImage,Ip_Mac,Financial_Year,Created_DT,Lastupdated_DT,Month_Year]
        );

        console.log("Insert Result: ", JSON.stringify(result));
        res.redirect('../ADMIN/cutomerdocuments.html'); // Redirect after successful insert
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).send('Server error');
    }
};
