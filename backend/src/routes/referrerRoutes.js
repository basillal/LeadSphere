const express = require('express');
const router = express.Router();
const {
    getReferrers,
    getReferrerById,
    createReferrer,
    updateReferrer,
    deleteReferrer,
    getReferrerStats,
    getReferrerStatsById,
    getReferrerLeads
} = require('../controllers/referrerController');

// Stats routes (must come before :id routes)
router.get('/stats', getReferrerStats);
router.get('/:id/stats', getReferrerStatsById);
router.get('/:id/leads', getReferrerLeads);

// CRUD routes
router.route('/')
    .get(getReferrers)
    .post(createReferrer);

router.route('/:id')
    .get(getReferrerById)
    .put(updateReferrer)
    .delete(deleteReferrer);

module.exports = router;
