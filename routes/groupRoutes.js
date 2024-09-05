const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authController = require('../controllers/authController')
const db = require('../models/db');



router.post('/add',groupController.addGroup);

// router.get('/get', async (req, res) => {
//     try {
//         const [group] = await db.query('SELECT * FROM grp');
//         res.json(group);
//     } catch (error) {
//         console.error('Database fetch error:', error);
//         res.status(500).send('Server error');
//     }
// });

router.use(authController.ensureAuthenticated);
router.get('/companies', groupController.getCompanies)
  router.get('/team-leads', groupController.getTeamLeads);
  router.get('/executives', groupController.getExecutives);
  router.get('/getbyTL', groupController.getGroupsByTeamLead);
  router.get('/get', groupController.getGroups);

  router.delete('/delete/:id', async (req, res) => {
    const groupId = req.params.id;
    let conn;

    try {
        conn = await db.getConnection();
        const result = await conn.query('DELETE FROM `groups` WHERE GRP_ID  = ?', [groupId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Database delete error:', error);
        res.status(500).send('Server error');
    } finally {
        if (conn) conn.end();
    }
});




// edit page

router.get('/grpedit/:id', async (req, res) => {
    const groupId = req.params.id;
    try {
        // Perform the database query to get group details
        const [rows] = await db.query('SELECT * FROM `groups` WHERE GRP_ID = ?', [groupId]);
        
        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // Send the group details as JSON
        res.json(rows[0]);
    } catch (error) {
        // Log and handle the error
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    }
});

router.put('/putEdit/:id', async (req, res) => {
    const groupId = req.params.id;
    const updatedGroup = req.body;

    try {
        // Use backticks around the table name `groups`
        const query = `
            UPDATE \`groups\` SET
            Group_Name = ?, Company = ?, Select_Lead = ?, Select_Employee = ?
            WHERE GRP_ID = ?
        `;

        // Perform the database query
        const [result] = await db.query(query, [
            updatedGroup.Group_Name,
            updatedGroup.Company,
            updatedGroup.Lead,
            updatedGroup.Employee,
            groupId
        ]);

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Group not found or no changes made' });
        }

        res.send('Group details updated successfully');
    } catch (error) {
        // Log and handle the error
        console.error('Database update error:', error);
        res.status(500).send('Server error');
    }
});
module.exports = router;