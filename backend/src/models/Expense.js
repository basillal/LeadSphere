const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        trim: true
    },
    expenseDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    },
    receipt: {
        type: String // URL to uploaded receipt
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

ExpenseSchema.index({ company: 1, expenseDate: 1 });
ExpenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
