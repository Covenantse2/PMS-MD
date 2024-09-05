// routes/executiveRoutes.js

const express = require('express');
const router = express.Router();
const executiveController = require('../controllers/executiveRoutes');

// Route to get all executives
router.get('/get', executiveController.getExecutives);

module.exports = router;
