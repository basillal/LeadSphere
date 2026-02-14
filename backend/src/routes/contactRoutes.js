const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { tenantFilter } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantFilter);

const {
    getContacts,
    getContact,
    createContact,
    convertLeadToContact,
    updateContact,
    deleteContact,
    getContactStats
} = require('../controllers/contactController');

// Stats route (must be before /:id)
router.get('/stats', getContactStats);

// Convert lead to contact
router.post('/convert/:leadId', convertLeadToContact);

// Main routes
router.route('/')
    .get(getContacts)
    .post(createContact);

router.route('/:id')
    .get(getContact)
    .put(updateContact)
    .delete(deleteContact);

module.exports = router;
