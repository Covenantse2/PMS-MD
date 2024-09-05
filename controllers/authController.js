const pool = require('../models/db'); // DB connection pool

exports.authenticateUser = async (req, res) => {
    const { role, username, password } = req.query;

    try {
        let user;

        const conn = await pool.getConnection();

        if (role === 'admin') {
            const rows = await conn.query('SELECT * FROM users WHERE role = ? AND username = ? AND password = ?', [role, username, password]);
            user = rows[0];
        } else if (role === 'tl' || role === 'executive') {
            const rows = await conn.query(`
                SELECT Employee_Name, Department_Desigination, Email, Employee_Code 
                FROM employee 
                WHERE Department_Desigination = ? AND Login_Id = ? AND Password = ?
            `, [role === 'tl' ? 'Team Lead' : 'Executive', username, password]);

            user = rows[0];
        }

        conn.release();

        // If a matching user is found, store the user details in the session
        if (user) {
            req.session.user = {
                role: role,
                username: user.username || username,  // Use username from form or DB
                name: user.Employee_Name,
                designation: user.Department_Desigination,
                email: user.Email,
                code: user.Employee_Code
            };

            // Redirect to the appropriate dashboard based on the role
            res.redirect('/' + role);
        } else {
            res.status(401).send('Unauthorized: Invalid username, password, or role');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// Middleware to ensure the user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();  // Allow the next middleware or route handler to execute
    } else {
        res.redirect('/');  // Redirect to login page if not authenticated
    }
};
