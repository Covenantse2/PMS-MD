// models/CustomerDocument.js

const db = require('./db');

exports.saveCustomerDocument = async (documentData) => {
    const sql = `INSERT INTO customer_documents 
                 (customer_name, aadhar_no, aadhar_image_path, pan_no, pan_image_path, bank_account_no, bank_passbook_image_path) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
        documentData.customer_name,
        documentData.aadhar_no,
        documentData.aadhar_image,
        documentData.pan_no,
        documentData.pan_image,
        documentData.bank_account_no,
        documentData.bank_passbook_image
    ]);
    return result;
};
