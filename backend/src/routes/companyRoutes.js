const express = require('express');
const router = express.Router();
const {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany
} = require('../controllers/companyController');

const { protect } = require('../middleware/authMiddleware');

// All company routes are protected
router.use(protect);

// TODO: strict 'Super Admin' middleware for create/list
// const { adminOnly } = require('../middleware/authMiddleware'); // Need to implement later

router.route('/')
    .get(getCompanies)
    .post(createCompany);

router.route('/:id')
    .get(getCompany)
    .put(updateCompany);

module.exports = router;
