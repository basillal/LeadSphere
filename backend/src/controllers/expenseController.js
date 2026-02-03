const Expense = require('../models/Expense');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
    const query = { ...(req.companyFilter || {}), isDeleted: false };

    if (req.query.search) {
        query.title = new RegExp(req.query.search, 'i');
    }
    
    if (req.query.category) {
        query.category = req.query.category;
    }

    if (req.query.startDate && req.query.endDate) {
        query.expenseDate = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    const expenses = await Expense.find(query)
        .populate('createdBy', 'name')
        .sort({ expenseDate: -1 });

    res.status(200).json({
        success: true,
        count: expenses.length,
        data: expenses
    });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id)
        .populate('createdBy', 'name');

    if (!expense || expense.isDeleted) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Permission check
    const userCompanyId = req.user.company?._id || req.user.company;
    const expenseCompanyId = expense.company?._id || expense.company;

    if (req.user.role?.roleName !== 'Super Admin') {
        if (!userCompanyId || (expenseCompanyId && expenseCompanyId.toString() !== userCompanyId.toString())) {
             res.status(404);
             throw new Error('Expense not found');
        }
    }

    res.status(200).json({
        success: true,
        data: expense
    });
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
    const { title, amount, category, expenseDate, description, receipt } = req.body;

    if (!title || !amount || !category) {
        res.status(400);
        throw new Error('Please provide title, amount and category');
    }

    const companyId = req.user.company?._id || req.user.company;

    const expense = await Expense.create({
        company: companyId,
        title,
        amount,
        category,
        expenseDate: expenseDate || new Date(),
        description,
        receipt,
        createdBy: req.user._id
    });

    logger.info(`Expense created: ${title} of ${amount} by ${req.user.name}`);
    await logAudit(req, 'CREATE', 'Expense', expense._id, `Created expense: ${title} (${amount})`);

    res.status(201).json({
        success: true,
        data: expense
    });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
    let expense = await Expense.findById(req.params.id);

    if (!expense || expense.isDeleted) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Permission check
    const userCompanyId = req.user.company?._id || req.user.company;
    const expenseCompanyId = expense.company?._id || expense.company;

    if (req.user.role?.roleName !== 'Super Admin') {
        if (!userCompanyId || (expenseCompanyId && expenseCompanyId.toString() !== userCompanyId.toString())) {
             res.status(404);
             throw new Error('Expense not found');
        }
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    await logAudit(req, 'UPDATE', 'Expense', expense._id, `Updated expense: ${expense.title}`);

    res.status(200).json({
        success: true,
        data: expense
    });
});

// @desc    Delete expense (Soft)
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Permission check
    const userCompanyId = req.user.company?._id || req.user.company;
    const expenseCompanyId = expense.company?._id || expense.company;

    if (req.user.role?.roleName !== 'Super Admin') {
        if (!userCompanyId || (expenseCompanyId && expenseCompanyId.toString() !== userCompanyId.toString())) {
             res.status(404);
             throw new Error('Expense not found');
        }
    }

    expense.isDeleted = true;
    await expense.save();

    await logAudit(req, 'DELETE', 'Expense', expense._id, `Soft deleted expense: ${expense.title}`);

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    getExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense
};
