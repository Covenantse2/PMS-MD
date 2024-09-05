const db = require('../models/db');
const moment = require('moment');


exports.addGroup = async (req, res) => {
    const {
        GR_GN, GR_COM, GR_SL, GR_SE
    } = req.body;
    let conn;
    const Ip_Mac = Math.floor(Math.random() * 1000000000); // Random number for Ip_Mac
    const Created_DT = moment().format('YYYY-MM-DD'); // Current date
    const Lastupdated_DT = Created_DT;
    const Month_Year = moment().format('MM-YYYY');

    // Get Financial Year
    // const getFinancialYearQuery = `SELECT Financial_Year FROM financial_year`;
    // const [financialYearResults] = await db.query(getFinancialYearQuery);

    // if (!financialYearResults.length) {
    //   return res.status(400).send('Financial Year not found');
    // }

    // const Financial_Year = financialYearResults[0].Financial_Year;

    try {
        conn = await db.getConnection();
        const query = `
            INSERT INTO \`groups\` (
                Group_Name, Company, Select_Lead, Select_Employee,Ip_Mac,Created_DT,Lastupdated_DT,Month_Year
            ) VALUES (?, ?, ?, ?,?,?,?,?)
        `;

        const values = [GR_GN, GR_COM, GR_SL, GR_SE,Ip_Mac,Created_DT,Lastupdated_DT,Month_Year];

        const result = await conn.query(query, values);
        const resultString = JSON.stringify(result, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );


        console.log("Insert Result: ",resultString);
        res.redirect('../ADMIN/groups.html');
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
};


exports.getCompanies = async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query('SELECT DISTINCT Company FROM employee');
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
};

exports.getTeamLeads = async (req, res) => {
    const companyName = req.query.companyName;  // Get company name from query parameters
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query(
            'SELECT DISTINCT Employee_Name FROM employee WHERE Department_Desigination = ? AND Company = ?',
            ['Team Lead', companyName]
        );
        res.json(rows);  // Send the filtered team leads back as JSON
    } catch (error) {
        console.error('Error fetching team leads:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
};

// Get executives based on selected company
exports.getExecutives = async (req, res) => {
    const companyName = req.query.companyName;  // Get company name from query parameters
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query(
            'SELECT DISTINCT Employee_Name FROM employee WHERE Department_Desigination = ? AND Company = ?',
            ['Executive', companyName]
        );
        res.json(rows);  // Send the filtered executives back as JSON
    } catch (error) {
        console.error('Error fetching executives:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
};


exports.getGroups = async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        const rows = await conn.query('SELECT * FROM `groups`');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching group data:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
};


exports.getGroupsByTeamLead = async (req, res) => {
    const teamLead = req.session.user ? req.session.user.Employee_Name : null; // Get team lead name from session
    let conn;
    if (!teamLead) {
        return res.status(401).send('Unauthorized: No team lead in session');
    }

    try {
        conn = await db.getConnection();
        const rows = await conn.query(`
            SELECT * FROM groups 
            WHERE Select_Lead = ?
        `, [teamLead]); // Use parameterized query to safely retrieve data
    console.log(teamLead);

        res.json(rows); // Send the group data to the frontend
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
};


