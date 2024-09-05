const express = require('express');
const path = require('path');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for authentication
router.get("/authenticate", authController.authenticateUser);

// Middleware to ensure the user is authenticated
router.use(authController.ensureAuthenticated);

// Protected routes for admin, tl, and executive
router.get('/admin', (req, res) => {
    if (req.session.user.role === 'admin') {
        res.sendFile(path.join(__dirname, '../public/ADMIN/home.html'));
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});

router.get('/tl', (req, res) => {
    if (req.session.user.role === 'tl') {
        res.sendFile(path.join(__dirname, '../public/TL/home.html'));
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});

router.get('/executive', (req, res) => {
    if (req.session.user.role === 'executive') {
        res.sendFile(path.join(__dirname, '../public/EXECUTIVE/home.html'));
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
});

module.exports = router;
