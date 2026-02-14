const express = require('express');
const router = express.Router();
const {
    getServiceRevenue,
    getMonthlyTransactions,
    getPaymentStatusStats,
    getContactBilling
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { tenantFilter } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantFilter);

router.get('/service-revenue', getServiceRevenue);
router.get('/monthly', getMonthlyTransactions);
router.get('/payment-status', getPaymentStatusStats);
router.get('/contact-billing', getContactBilling);

module.exports = router;
