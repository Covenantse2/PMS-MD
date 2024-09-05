const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const employeeController = require('../controllers/employeeController');
const pool = require('../models/db')

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


// Routes for employee operations
router.post('/add', upload.single('AEM_DOC'), employeeController.addEmployee);

router.get('/get', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const employees = await conn.query('SELECT * FROM employee');
        res.json(employees);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});

router.get('/companies', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT Company_Name FROM company');
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});

router.delete('/delete/:id', employeeController.deleteEmployee);


//   edit employee


router.get('/edit/:id', async (req, res) => {
    const employeeId = req.params.id;
    let conn;

    try {
        conn = await pool.getConnection();
        // Perform the database query to get employee details
        const rows = await conn.query('SELECT * FROM employee WHERE EM_ID = ?', [employeeId]);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Send the employee details as JSON
        res.json(rows[0]);
    } catch (error) {
        // Log and handle the error
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});

// Update employee details
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
      db.query(sql, values, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  };
  
  // PUT route to update employee details
  router.put('/putEdit/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;
    const employeeData = req.body;
  
    // Construct SQL query for updating employee details
    const sql = `
      UPDATE employee
      SET
        Employee_Name = ?,
        Employee_Code = ?,
        Gender = ?,
        Company = ?,
        Department_Name = ?,
        Department_Desigination = ?,
        Department_Category = ?,
        Shift = ?,
        Shift_Starttime = ?,
        Shift_Endtime = ?,
        Educational_Qualification = ?,
        Department = ?,
        Experience = ?,
        Previous_Company = ?,
        Experience_Years = ?,
        Experience_Months = ?,
        Date_of_Birth = ?,
        Place_of_Birth = ?,
        Blood_Group = ?,
        Date_of_Joining = ?,
        Employment_Type = ?,
        Employment_Status = ?,
        Personal_Mobile = ?,
        Work_Mobile = ?,
        Extension = ?,
        Biometric_Id = ?,
        Father_Name = ?,
        Mother_Name = ?,
        Residential_Address = ?,
        Residential_Address_Line1 = ?,
        Residential_Address_Line2 = ?,
        Residential_City = ?,
        Residential_District = ?,
        Residential_State = ?,
        Residential_Pincode = ?,
        Residential_Country = ?,
        Permanent_Address = ?,
        Permanent_Address_Line1 = ?,
        Permanent_Address_Line2 = ?,
        Permanent_City = ?,
        Permanent_District = ?,
        Permanent_State = ?,
        Permanent_Pincode = ?,
        Permanent_Country = ?,
        Contact_Number = ?,
        Email = ?,
        Aadhar_Card = ?,
        Voter_Id = ?,
        Record_Status = ?,
        Record_Location = ?,
        Remarks = ?,
        Uan_Number = ?,
        Login_Id = ?,
        Password = ?,
        Uan_Login_Phone = ?,
        Aadhar_Link_Phone = ?,
        Bank_Name = ?,
        Bank_Branch = ?,
        IFSC_Code = ?,
        Account_Number = ?,
        Pass_Word = ?,
        Employee_Photo = ?
      WHERE EM_ID  = ?
    `;
  
    const values = [
      employeeData.Employee_Name,
      employeeData.Employee_Code,
      employeeData.Gender,
      employeeData.Company,
      employeeData.Department_Name,
      employeeData.Department_Designation,
      employeeData.Department_Category,
      employeeData.Shift,
      employeeData.Shift_Starttime,
      employeeData.Shift_Endtime,
      employeeData.Educational_Qualification,
      employeeData.Department,
      employeeData.Experience,
      employeeData.Previous_Company,
      employeeData.Experience_Years,
      employeeData.Experience_Months,
      employeeData.Date_of_Birth,
      employeeData.Place_of_Birth,
      employeeData.Blood_Group,
      employeeData.Date_of_Joining,
      employeeData.Employment_Type,
      employeeData.Employment_Status,
      employeeData.Personal_Mobile,
      employeeData.Work_Mobile,
      employeeData.Extension,
      employeeData.Biometric_Id,
      employeeData.Father_Name,
      employeeData.Mother_Name,
      employeeData.Residential_Address,
      employeeData.Residential_Address_Line1,
      employeeData.Residential_Address_Line2,
      employeeData.Residential_City,
      employeeData.Residential_District,
      employeeData.Residential_State,
      employeeData.Residential_Pincode,
      employeeData.Residential_Country,
      employeeData.Permanent_Address,
      employeeData.Permanent_Address_Line1,
      employeeData.Permanent_Address_Line2,
      employeeData.Permanent_City,
      employeeData.Permanent_District,
      employeeData.Permanent_State,
      employeeData.Permanent_Pincode,
      employeeData.Permanent_Country,
      employeeData.Contact_Number,
      employeeData.Email,
      employeeData.Aadhar_Card,
      employeeData.Voter_Id,
      employeeData.Record_Status,
      employeeData.Record_Location,
      employeeData.Remarks,
      employeeData.Uan_Number,
      employeeData.Login_Id,
      employeeData.Password,
      employeeData.Uan_Login_Phone,
      employeeData.Aadhar_Link_Phone,
      employeeData.Bank_Name,
      employeeData.Bank_Branch,
      employeeData.IFSC_Code,
      employeeData.Account_Number,
      employeeData.Pass_Word,
      employeeData.Employee_Photo,
      employeeId
    ];
  
    try {
      const result = await query(sql, values);
      res.redirect('/public/ADMIN/employees.html');
      res.json({ message: 'Employee updated successfully!' });
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ message: 'There was a problem updating employee details.' });
    }
  });

  router.get('/getGender', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Employee' AND Column_Name = 'Gender'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
  router.get('/getDeptCat', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Employee' AND Column_Name = 'Department Category'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
  router.get('/getDeptName', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Employee' AND Column_Name = 'Department Name'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
  
  router.get('/getShift', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Employee' AND Column_Name = 'Shift'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
  router.get('/getEduQul', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Employee' AND Column_Name = 'Education Qualification'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
  router.get('/getExp', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Employee' AND Column_Name = 'Experience'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
  router.get('/getEmpType', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Employee' AND Column_Name = 'Employee Type'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
  router.get('/getEmpStatus', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT DISTINCT Column_Description FROM final_module WHERE Module='Process Management' AND Sub_Modue='Employee' AND Column_Name = 'Employee Status'");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching document types:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.end();
    }
});
  
module.exports = router;

