const express = require('express');
const router = express.Router();
const {
    getExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense
} = require('../controllers/expenseController');

const { protect } = require('../middleware/authMiddleware');
const { tenantFilter } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantFilter);

router.route('/')
    .get(getExpenses)
    .post(createExpense);

router.route('/:id')
    .get(getExpense)
    .put(updateExpense)
    .delete(deleteExpense);

module.exports = router;
