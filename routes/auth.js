const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for authentication
router.get("/authenticate", authController.authenticateUser);

// Middleware to ensure the user is authenticated
router.use(authController.ensureAuthenticated);

// Route for admin home page
router.get('/admin', (req, res) => {
    if (req.session.user.role === 'admin') {
        res.sendFile(path.join(__dirname, '../public/ADMIN/home.html'));
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});

// Route for team lead home page
router.get('/tl', (req, res) => {
    if (req.session.user.role === 'tl') {
        console.log(`Welcome Team Lead: ${req.session.user.name}`); // Log for debugging
        res.sendFile(path.join(__dirname, '../public/TL/home.html'));
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});

// Route for executive home page
router.get('/executive', (req, res) => {
    if (req.session.user.role === 'executive') {
        console.log(`Welcome Executive: ${req.session.user.name}`); // Log for debugging
        res.sendFile(path.join(__dirname, '../public/EXECUTIVE/home.html'));
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});

module.exports = router;