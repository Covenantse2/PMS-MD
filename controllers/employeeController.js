const db = require('../models/db'); // Ensure the path is correct for your project structure
const moment = require('moment');

exports.addEmployee = async (req, res) => {
    
    const {
        AEM_EN, AEM_EC, AEM_DD_GN, company, AEM_DD_DC, AEM_DD_DN, AEM_DD_DD,
        AEM_DD_SF, AEM_ST, AEM_ET, AEM_DD_EQ, AEM_DP, AEM_DD_EX, AEM_PC, AEM_EY,
        AEM_EM, AEM_DB, AEM_PB, AEM_BG, AEM_DJ, AEM_DD_ET, AEM_DD_ES, AEM_PM,
        AEM_WM, AEM_ES, AEM_ID, AEM_FN, AEM_MN, AEM_RA, AEM_AD, AEM_ADD, AEM_CIT,
        AEM_DIS, AEM_STA, AEM_PIN, AEM_COU, AEM_PA, AEM_PAL, AEM_PALL, AEM_PCIT,
        AEM_PDIS, AEM_PSTA, AEM_PPIN, AEM_PCOU, AEM_CTN, AEM_EMAIL, AEM_AC, AEM_VID,
        AEM_RS, AEM_RL, AEM_RK, AEM_UAN, AEM_LID, AEM_PAS, AEM_ULP, AEM_ALP, AEM_BN,
        AEM_BR, AEM_IFS, AEM_ATN, AEM_PASS
    } = req.body;

    const employeePhotoPath = req.file ? `/uploads/${req.file.filename}` : null;
    let conn;
    // Generate additional fields
    const Ip_Mac = Math.floor(Math.random() * 1000000000); // Random number for Ip_Mac
    const Created_DT = moment().format('YYYY-MM-DD'); // Current date
    const Lastupdated_DT = Created_DT; // Same as Created_DT
    const Month_Year = moment().format('MM-YYYY'); // Current month and year

    // Query to get the Financial_Year from the financial_year table
    // const getFinancialYearQuery = `SELECT Financial_Year FROM financial_year`;

    try {
        conn = await db.getConnection();
        // const [financialYearResults] = await conn.query(getFinancialYearQuery);
        // const Financial_Year = financialYearResults[0] ? financialYearResults[0].Financial_Year : null; // Get the latest financial year

        // // Check if financial year is available
        // if (!Financial_Year) {
        //     return res.status(400).send('Financial Year not found');
        // }

        // Insert data into the employee table
        const query = `
            INSERT INTO employee (
                Employee_Name, Employee_Code, Gender, Company, Department_Category, 
                Department_Name, Department_Desigination, Shift, Shift_Starttime, 
                Shift_Endtime, Educational_Qualification, Department, Experience, 
                Previous_Company, Experience_Years, Experience_Months, 
                Date_of_Birth, Place_of_Birth, Blood_Group, Date_of_Joining, Employment_Type, 
                Employment_Status, Personal_Mobile, Work_Mobile, Extension, Biometric_Id, 
                Father_Name, Mother_Name, Residential_Address, Residential_Address_Line1, Residential_Address_Line2, 
                Residential_City, Residential_District, Residential_State, Residential_Pincode, Residential_Country, Permanent_Address, 
                Permanent_Address_Line1, Permanent_Address_Line2, Permanent_City, 
                Permanent_District, Permanent_State, Permanent_Pincode, Permanent_Country, 
                Contact_Number, Email, Aadhar_Card, Voter_Id, Record_Status, Record_Location, 
                Remarks, Uan_Number, Login_Id, Password, Uan_Login_Phone, Aadhar_Link_Phone, 
                Bank_Name, Bank_Branch, IFSC_Code, Account_Number, Pass_Word, Employee_Photo, Ip_Mac, Created_DT, Lastupdated_DT, Month_Year
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const values = [
            AEM_EN, AEM_EC, AEM_DD_GN, company, AEM_DD_DC, AEM_DD_DN, AEM_DD_DD,
            AEM_DD_SF, AEM_ST, AEM_ET, AEM_DD_EQ, AEM_DP, AEM_DD_EX, AEM_PC, AEM_EY,
            AEM_EM, AEM_DB, AEM_PB, AEM_BG, AEM_DJ, AEM_DD_ET, AEM_DD_ES, AEM_PM,
            AEM_WM, AEM_ES, AEM_ID, AEM_FN, AEM_MN, AEM_RA, AEM_AD, AEM_ADD, AEM_CIT,
            AEM_DIS, AEM_STA, AEM_PIN, AEM_COU, AEM_PA, AEM_PAL, AEM_PALL, AEM_PCIT,
            AEM_PDIS, AEM_PSTA, AEM_PPIN, AEM_PCOU, AEM_CTN, AEM_EMAIL, AEM_AC, AEM_VID,
            AEM_RS, AEM_RL, AEM_RK, AEM_UAN, AEM_LID, AEM_PAS, AEM_ULP, AEM_ALP, AEM_BN,
            AEM_BR, AEM_IFS, AEM_ATN, AEM_PASS, employeePhotoPath, Ip_Mac, Created_DT, Lastupdated_DT, Month_Year
        ];

        const result = await conn.query(query, values);
        const resultString = JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );

        console.log("Insert Result: ", resultString);
        res.redirect('/ADMIN/employees.html'); // Ensure the path is correct
    } catch (error) {
        console.error('Error processing employee details:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) conn.end();
    }
};
exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    let conn;

    try {
        conn = await db.getConnection();
        const result = await conn.query('DELETE FROM employee WHERE EM_ID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Employee not found');
        }
        res.status(200).send('Employee deleted successfully');
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
};
