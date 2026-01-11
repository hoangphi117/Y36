const express = require('express');
const router = express.Router();
const { getDashboardStats, getDailyStats } = require('../../controllers/admin/statsController');

router.get('/dashboard', getDashboardStats);
router.get('/daily/:date', getDailyStats);

module.exports = router;