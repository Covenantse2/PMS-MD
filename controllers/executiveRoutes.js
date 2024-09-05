// controllers/executiveController.js

exports.getExecutives = async (req, res) => {
    try {
        // Fetch executives from the SQL database
        const result = await db.query(`SELECT * FROM grp`);
        
        // Send the data as JSON
        res.json(result);
    } catch (error) {
        console.error('Database fetch error:', error);
        res.status(500).send('Server error');
    }
};
