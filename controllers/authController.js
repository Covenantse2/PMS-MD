const pool = require('../models/db'); // DB connection pool

exports.authenticateUser = async (req, res) => {
    const { role, username, password } = req.query;

    try {
        let user;
        
        // Get a connection from the pool
        const conn = await pool.getConnection();

        // If the role is 'admin', check in the 'users' table
        if (role === 'admin') {
            const rows = await conn.query('SELECT * FROM users WHERE role = ? AND username = ? AND password = ?', [role, username, password]);
            user = rows[0]; // Assumes the users table has role, username, and password fields

        // If the role is 'tl' or 'executive', check in the 'employee' table
        } else if (role === 'tl' || role === 'executive') {
            const rows = await conn.query(`
                SELECT Employee_Name, Department_Desigination, Email, Employee_Code 
                FROM employee 
                WHERE Department_Desigination = ? AND Login_Id = ? AND Password = ?
            `, [role === 'tl' ? 'Team Lead' : 'Executive', username, password]);

            user = rows[0]; // Get the first matching employee record
        }

        // Release the connection back to the pool
        conn.release();

        // Validate user and set session
        if (user) {
            // Store the relevant user details in the session
            req.session.user = {
                role: role,
                username: user.username || username,  // In case 'username' is not in employee
                name: user.Employee_Name,
                designation: user.Department_Desigination,
                email: user.Email,
                code: user.Employee_Code
            };

            res.redirect('/' + role); // Redirect based on the role (admin, tl, executive)
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
