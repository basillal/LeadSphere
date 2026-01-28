const express = require('express');
const router = express.Router();
// Correction: const express = require('express'); const router = express.Router();

const {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    getLeadStats
} = require('../controllers/leadController');

const { protect } = require('../middleware/authMiddleware');
const { tenantFilter } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantFilter);

router.route('/')
    .get(getLeads)
    .post(createLead);

router.route('/stats')
    .get(getLeadStats);

router.route('/:id')
    .get(getLead)
    .put(updateLead)
    .delete(deleteLead);

module.exports = router;
