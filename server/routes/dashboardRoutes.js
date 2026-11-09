const express = require('express');
const router = express.Router();
const { getDashboardSummary, seedData } = require('../controllers/dashboardController');

router.get('/summary', getDashboardSummary);
router.post('/seed', seedData);

module.exports = router;

