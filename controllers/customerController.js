const pool = require('../models/db'); // Ensure the path is correct
const moment = require('moment');

exports.addCustomer = async (req, res) => {
    const {
        CAT_DD_AO, CAT_DD_RAT, ACC_ID, CAT_CN, CAT_PACN, CAT_CWS, CAT_CPHN, CAT_FAX, CAT_EM,
        CAT_ACEMLS, CAT_CEONM, CAT_CEOEM, CAT_DD_CT, CAT_DD_OWR, CAT_IND, CAT_EMP, CAT_DD_AMO,
        CAT_AR, CAT_DD_AMO0, CAT_ER, CAT_PCN, CAT_SCN, CAT_PPHN, CAT_SPHN, CAT_PEML, CAT_SEML,
        CAT_DD_PD, CAT_DD_SD, CAT_PRMKS, CAT_SRMKS, CAT_BAN, CAT_AHN, CAT_IFC, CAT_BRN, CAT_SIC,
        CAT_TCS, CAT_PAN, CAT_GV, CAT_CAA, CAT_CAG, CAT_BSR, CAT_SSR, CAT_BCI, CAT_SCI, CAT_BST,
        CAT_SST, CAT_BZP, CAT_SZP, CAT_BC0, CAT_SCO
    } = req.body;

    // Generate additional fields
    const Ip_Mac = Math.floor(Math.random() * 1000000000); // Random number for Ip_Mac
    const Created_DT = moment().format('YYYY-MM-DD'); // Current date
    const Lastupdated_DT = Created_DT; // Same as Created_DT
    const Month_Year = moment().format('MM-YYYY'); // Current month and year

    // Query to get the Financial_Year from the financial_year table
    // const getFinancialYearQuery = `SELECT Financial_Year FROM financial_year`;

    let conn;
    try {
        conn = await pool.getConnection();
        
        // // Fetch the financial year
        // const [financialYearResults] = await conn.query(getFinancialYearQuery);
        // const Financial_Year = financialYearResults[0] ? financialYearResults[0].Financial_Year : null; // Get the latest financial year

        // // Check if financial year is available
        // if (!Financial_Year) {
        //     return res.status(400).send('Financial Year not found');
        // }

        // Insert data into the customer table
        const query = `
            INSERT INTO customer (
                Account_Owner, Account_Ratings, Company_Id, Company_Name, Parentcompany_Name, Website, Phone, Fax, Email, Accounts_Email,
                Ceo_Name, Ceo_Email, Company_Type, Ownership, Industry, Employees, Annualrev_Select, Annual_Revenue, Expectedrev_Select, Expected_Revenue,
                Primary_Contactname, Secondary_Contactname, Primary_Phone, Secondary_Phone, Primary_Email, Secondary_Email,
                Primary_Designation, Secondary_Designaion, Primary_Remarks, Secondary_Remarks, Bank_Accountno, Account_Holder,
                Ifsc_Code, Branch_Name, Sic_Code, Tcs_Tds, Company_Pan, Gst_Vat, Credit_Amountallowed, Credit_Age,
                Billing_Street, Shipping_Street, Billing_City, Shipping_City, Billing_State, Shipping_State, Billing_Zipcode,
                Shipping_Zipcode, Billing_Country, Shipping_Country, Ip_Mac, Created_DT, Lastupdated_DT, Month_Year
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const values = [
            CAT_DD_AO, CAT_DD_RAT, ACC_ID, CAT_CN, CAT_PACN, CAT_CWS, CAT_CPHN, CAT_FAX, CAT_EM,
            CAT_ACEMLS, CAT_CEONM, CAT_CEOEM, CAT_DD_CT, CAT_DD_OWR, CAT_IND, CAT_EMP, CAT_DD_AMO,
            CAT_AR, CAT_DD_AMO0, CAT_ER, CAT_PCN, CAT_SCN, CAT_PPHN, CAT_SPHN, CAT_PEML, CAT_SEML,
            CAT_DD_PD, CAT_DD_SD, CAT_PRMKS, CAT_SRMKS, CAT_BAN, CAT_AHN, CAT_IFC, CAT_BRN, CAT_SIC,
            CAT_TCS, CAT_PAN, CAT_GV, CAT_CAA, CAT_CAG, CAT_BSR, CAT_SSR, CAT_BCI, CAT_SCI, CAT_BST,
            CAT_SST, CAT_BZP, CAT_SZP, CAT_BC0, CAT_SCO, Ip_Mac, Created_DT, Lastupdated_DT, Month_Year
        ];

        const result = await conn.query(query, values);
        const resultString = JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );

        console.log("Insert Result: ",resultString);
        res.redirect('/ADMIN/customers.html'); // Ensure the path is correct
    } catch (error) {
        console.error('Error processing customer details:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) conn.end();
    }
};

exports.deleteCustomer = async (req, res) => {
    const { id } = req.params;

    let conn;
    try {
        conn = await pool.getConnection();
        
        const result = await conn.query('DELETE FROM customer WHERE CUS_ID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Customer not found');
        }
        res.status(200).send('Customer deleted successfully');
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
};
