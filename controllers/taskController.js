const db = require('../models/db');
const moment = require('moment');
const path = require('path');

// Add Task
exports.addTask = async (req, res) => {
    console.log('Session:', req.session);
    const {
        ATK_DD_EXE, // Executive name selected from the form
        CMP_ID,
        ATK_DD_CMP,
        DCT,
        DCN, // Document Name
        TSN,
        TSD,
        REM,
        ATK_DD_STA,
        SERTY, // Service Type
        ACOW,
        DSNG 
    } = req.body;
    let conn;
    // Ensure session data is available
    if (!req.session || !req.session.user) {
        return res.status(401).send('Unauthorized: No session data found');
    }

    const sessionUser = req.session.user;
    const Primary_Role = sessionUser.designation;
    const Primary_Email = sessionUser.email; // Executive's Email
    const Primary_ID = sessionUser.code; // Executive's Employee_Code
    const Primary_Name = sessionUser.name; // Executive's Employee_Name

    // Debugging: Log the selected executive name
    console.log('Selected Executive Name:', ATK_DD_EXE);
    console.log('Session User:', sessionUser);

    // Fetch the Executive's details based on the selected Executive_Name from the form
    let secondaryRole, secondaryEmail, secondaryID, secondaryName;

    try {
        conn = await db.getConnection();
        const [executive] = await db.query(
            'SELECT Department_Desigination, Email, Employee_Code, Employee_Name FROM employee WHERE Employee_Name = ?',
            [ATK_DD_EXE]
        );

        if (executive.length > 0) {
            secondaryRole = executive[0].Department_Desigination;
            secondaryEmail = executive[0].Email;
            secondaryID = executive[0].Employee_Code;
            secondaryName = executive[0].Employee_Name;
        } else {
            return res.status(404).send('Executive not found');
        }
    } catch (error) {
        console.error('Error fetching executive details:', error);
        return res.status(500).send('Server error');
    }finally {
        if (conn) conn.end();
    }

    // Validation: Check if the secondary role is "Executive"
    if (secondaryRole !== "Executive") {
        return res.status(403).send('Error: The selected employee is not an Executive.');
    }

    // Multer stores the file path in `req.file` if a file is uploaded
    const DURL = req.file ? `/uploads/${req.file.filename}` : null;

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
            `INSERT INTO assign_task (
                Designation,Executive_Name, Company_Id,Account_Owner, Company_Name,Service_Type, Document_Type, Document_Name, Doument_URL, Task_Name, Task_Details, 
                Remarks, Status, Ip_Mac, Financial_Year, Primary_Roles, Primary_Email, Primary_ID, Primary_Name, 
                Secondary_Roles, Secondary_Email, Secondary_ID, Secondary_Name, Created_DT, Lastupdated_DT, Month_Year
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`,
            [
                DSNG, ATK_DD_EXE, CMP_ID,ACOW, ATK_DD_CMP,SERTY, DCT, DCN,DURL,TSN, TSD, REM, ATK_DD_STA,
                  // Added Service Type
                Ip_Mac, Financial_Year, Primary_Role, Primary_Email, Primary_ID, Primary_Name,
                secondaryRole, secondaryEmail, secondaryID, secondaryName, Created_DT, Lastupdated_DT, Month_Year
            ]
        );

        console.log("Insert Result: ", JSON.stringify(result));
        res.redirect('../TL/assigntask.html');
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).send('Server error');
    }
};

// Get Tasks
exports.getTasks = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM assign_task');
        res.json(rows);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    }
};

// Delete Task
exports.deleteTask = async (req, res) => {
    const taskId = req.params.id;
    try {
        const result = await db.query('DELETE FROM assign_task WHERE AT_ID = ?', [taskId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Database delete error:', error);
        res.status(500).send('Server error');
    }
};
