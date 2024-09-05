const db = require('../models/db');
const moment = require('moment');

exports.addTask = async (req, res) => {
    const {
        ATK_DD_EXE1, // Executive name selected from the form
        CMP_ID1,
        ATK_DD_CMP1,
        DCT1,
        DOCN1,
        TSN1,
        TSD1,
        REM1,
        ATK_DD_STA1
    } = req.body;

    // Ensure session data is available
    if (!req.session || !req.session.user) {
        return res.status(401).send('Unauthorized: No session data found');
    }

    // Get Secondary (Executive) details from the session
    const sessionUser = req.session.user;
    const Secondary_Email = sessionUser.email; // Executive's Email
    const Secondary_ID = sessionUser.code; // Executive's Employee_Code
    const Secondary_Name = sessionUser.name; // Executive's Employee_Name

    // Debugging: Log the selected executive name
    console.log('Selected Executive Name:', ATK_DD_EXE1);
    console.log('Session User:', sessionUser);

    // Fetch the Primary (Team Lead) details based on the selected Executive_Name from the form
    let Primary_Roles, Primary_Email, Primary_ID, Primary_Name;

    try {
        const [teamLead] = await db.query(
            'SELECT Department_Desigination, Email, Employee_Code, Employee_Name FROM employee WHERE Employee_Name = ? AND Department_Desigination = "Team Lead"',
            [ATK_DD_EXE1]
        );

        // Debugging: Log the result of the query
        console.log('Team Lead Query Result:', teamLead);

        if (teamLead.length > 0) {
            Primary_Roles = teamLead[0].Department_Desigination; // Team Lead's Role
            Primary_Email = teamLead[0].Email; // Team Lead's Email
            Primary_ID = teamLead[0].Employee_Code; // Team Lead's Employee_Code
            Primary_Name = teamLead[0].Employee_Name; // Team Lead's Employee_Name
        } else {
            return res.status(404).send('Team Lead not found or the selected employee is not a Team Lead.');
        }
    } catch (error) {
        console.error('Error fetching Team Lead details:', error);
        return res.status(500).send('Server error');
    }

    // Multer stores the file path in `req.file` if a file is uploaded
    const DURL1 = req.file ? `/uploads/${req.file.filename}` : null;

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
            `INSERT INTO upload_task (
                Executive_Name, Company_Id, Company_Name, Document_Type, Document_Name, Doument_URL, Task_Name, Task_Details, 
                Remarks, Status, Ip_Mac, Financial_Year, Primary_Roles, Primary_Email, Primary_ID, Primary_Name, 
                Secondary_Roles, Secondary_Email, Secondary_ID, Secondary_Name, Created_DT, Lastupdated_DT, Month_Year
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ATK_DD_EXE1, CMP_ID1, ATK_DD_CMP1, DCT1, DOCN1, DURL1, TSN1, TSD1, REM1, ATK_DD_STA1,
                Ip_Mac, Financial_Year, Primary_Roles, Primary_Email, Primary_ID, Primary_Name,
                sessionUser.designation, Secondary_Email, Secondary_ID, Secondary_Name, Created_DT, Lastupdated_DT, Month_Year
            ]
        );

        console.log("Insert Result: ", JSON.stringify(result));
        res.redirect('../EXECUTIVE/addtask.html');
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).send('Server error');
    }
};


exports.getexecutiveDetail = async (req, res) => {
     try {
        // Fetch data from the assign_task table
        const [rows] = await db.query(`
            SELECT Company_Name, Task_Name, Document_Name, Remarks, Status 
            FROM assign_task
        `);

        res.json(rows); // Return data as JSON
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    }
};

exports.getTasks = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM upload_task');
        res.json(rows);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    }
};



