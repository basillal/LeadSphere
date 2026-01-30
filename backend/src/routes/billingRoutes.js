const express = require('express');
const router = express.Router();
const {
    getBillings,
    getBilling,
    createBilling,
    updateBilling,
    deleteBilling
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const { tenantFilter } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantFilter);

router.route('/')
    .get(getBillings)
    .post(createBilling);

router.route('/:id')
    .get(getBilling)
    .put(updateBilling)
    .delete(deleteBilling);

module.exports = router;
