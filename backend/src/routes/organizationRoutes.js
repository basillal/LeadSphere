const express = require('express');
const router = express.Router();
const {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization
} = require('../controllers/organizationController');

const { protect } = require('../middleware/authMiddleware');

// All organization routes are protected
router.use(protect);

// TODO: strict 'Super Admin' middleware for create/list
// const { adminOnly } = require('../middleware/authMiddleware'); // Need to implement later

router.route('/')
    .get(getOrganizations)
    .post(createOrganization);

router.route('/:id')
    .get(getOrganization)
    .put(updateOrganization);

module.exports = router;
