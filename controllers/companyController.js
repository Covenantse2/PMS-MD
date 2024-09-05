const db = require('../models/db'); // Ensure the path is correct for your project structure
const moment = require('moment');

exports.addCompany = async (req, res) => {
  try {
    const {
      CCP_CN, CCP_AID, CCP_PHN, CCP_EMAIL, CCP_WEB, CCP_FAX,
      CCP_NOE, CCP_DD_AMO, CCP_AR, CCP_SKY, CCP_GST, CCP_PAN,
      CCP_DD_ETAX, CCP_DD_ETDS, CCP_BKN, CCP_BRN, CCP_CRN,
      CCP_ACTNO, IFSC, CCP_DNO, CCP_STR, CCP_CIT, CCP_STA,
      CCP_ZIP, CCP_COU, CCP_DES
    } = req.body;

    const Company_Logo = req.file ? `/uploads/${req.file.filename}` : null;

    // Additional fields
    const Ip_Mac = Math.floor(Math.random() * 1000000000); // Random number for Ip_Mac
    const Created_DT = moment().format('YYYY-MM-DD'); // Current date
    const Lastupdated_DT = Created_DT;
    const Month_Year = moment().format('MM-YYYY');

    // Get Financial Year
    const getFinancialYearQuery = `SELECT Financial_Year FROM financial_year`;
    const financialYearResults = await db.query(getFinancialYearQuery);

    if (!financialYearResults.length) {
      return res.status(400).send('Financial Year not found');
    }

    const Financial_Year = financialYearResults[0].Financial_Year;

    // Insert data into the company table
    const insertCompanyQuery = `
      INSERT INTO company (
        Company_Name, Company_Accid, Phone, Email, Website, Fax,
        Numberof_Employees, Annualrevenue_Select, Annual_Revenue, Skype_Id, Gst_Vat, Business_Pan,
        Enable_Tax, Enable_Tds, Bank_Name, Branch_Name, Crn_Id,
        Account_No, Ifsc_Code, Door_No, Street, City, State,
        Zipcode, Country, Description, Company_Logo, Ip_Mac, Financial_Year, Created_DT,
        Lastupdated_DT, Month_Year
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      CCP_CN, CCP_AID, CCP_PHN, CCP_EMAIL, CCP_WEB, CCP_FAX,
      CCP_NOE, CCP_DD_AMO, CCP_AR, CCP_SKY, CCP_GST, CCP_PAN,
      CCP_DD_ETAX, CCP_DD_ETDS, CCP_BKN, CCP_BRN, CCP_CRN,
      CCP_ACTNO, IFSC, CCP_DNO, CCP_STR, CCP_CIT, CCP_STA,
      CCP_ZIP, CCP_COU, CCP_DES, Company_Logo, Ip_Mac, Financial_Year,
      Created_DT, Lastupdated_DT, Month_Year
    ];

    await db.query(insertCompanyQuery, values);

    res.redirect('/ADMIN/company.html');
  } catch (error) {
    console.error("Error processing company details:", error);
    res.status(500).send('Internal Server Error');
  }
};
