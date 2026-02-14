const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { tenantFilter } = require('../middleware/tenantMiddleware');

router.get('/', protect, tenantFilter, dashboardController.getDashboardStats);

module.exports = router;
