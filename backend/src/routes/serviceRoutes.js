const express = require('express');
const router = express.Router();
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { tenantFilter } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantFilter);

router.route('/')
    .get(getServices)
    .post(createService);

router.route('/:id')
    .get(getService)
    .put(updateService)
    .delete(deleteService);

module.exports = router;
