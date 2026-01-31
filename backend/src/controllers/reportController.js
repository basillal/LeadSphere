const Billing = require('../models/Billing');
const Expense = require('../models/Expense');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Helper to get company filter
const getCompanyFilter = (req) => {
    return req.companyFilter ? { ...req.companyFilter, isDeleted: false } : { isDeleted: false };
};

// Helper to get date filter from query params
const getDateFilter = (query) => {
    const { startDate, endDate, year } = query;
    let start, end;

    if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    } else {
        const targetYear = parseInt(year) || new Date().getFullYear();
        start = new Date(`${targetYear}-01-01`);
        end = new Date(`${targetYear}-12-31`);
        end.setHours(23, 59, 59, 999);
    }
    return { start, end };
};

// @desc    Get Revenue by Service
// @route   GET /api/reports/service-revenue
// @access  Private
const getServiceRevenue = asyncHandler(async (req, res) => {
    const baseQuery = getCompanyFilter(req);
    const { start, end } = getDateFilter(req.query);

    // Ensure company ID is ObjectId in match
    const matchQuery = { 
        ...baseQuery,
        billingDate: { $gte: start, $lte: end }
    };
    if (matchQuery.company) {
        matchQuery.company = new mongoose.Types.ObjectId(matchQuery.company);
    }

    // Use Aggregation
    const revenue = await Billing.aggregate([
        { $match: matchQuery }, 
        { $unwind: '$services' },
        { 
            $group: {
                _id: '$services.serviceId',
                serviceName: { $first: '$services.serviceName' },
                totalRevenue: { $sum: '$services.totalAmount' },
                count: { $sum: 1 }
            }
        },
        // Optional: Lookup service details if name is missing
        { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: revenue
    });
});

// @desc    Get Monthly Transactions
// @route   GET /api/reports/monthly
// @access  Private
// @desc    Get Revenue Analytics (Monthly/Daily)
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyTransactions = asyncHandler(async (req, res) => {
    const baseQuery = getCompanyFilter(req);
    const { start, end } = getDateFilter(req.query);

    // Determine grouping: Daily if range <= 60 days, else Monthly
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const groupBy = diffDays <= 65 ? 'day' : 'month'; // slightly > 2 months

    const matchQuery = { ...baseQuery };
    if (matchQuery.company) {
        matchQuery.company = new mongoose.Types.ObjectId(matchQuery.company);
    }

    // Aggregate Revenue (Billing)
    const stats = await Billing.aggregate([
        {
            $match: {
                ...matchQuery,
                billingDate: { $gte: start, $lte: end }
            }
        },
        {
            $group: {
                _id: groupBy === 'day' 
                    ? { $dateToString: { format: "%Y-%m-%d", date: "$billingDate" } }
                    : { $month: "$billingDate" },
                revenue: { $sum: '$grandTotal' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    // Aggregate Expenses
    const expenseStats = await Expense.aggregate([
        {
            $match: {
                ...matchQuery,
                expenseDate: { $gte: start, $lte: end }
            }
        },
        {
            $group: {
                _id: groupBy === 'day' 
                    ? { $dateToString: { format: "%Y-%m-%d", date: "$expenseDate" } }
                    : { $month: "$expenseDate" },
                amount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    let result = [];
    if (groupBy === 'day') {
        // Evaluate daily data
        // Create a map of all dates
        const dateMap = new Map();
        
        stats.forEach(item => {
            if (!dateMap.has(item._id)) dateMap.set(item._id, { revenue: 0, expenses: 0 });
            dateMap.get(item._id).revenue = item.revenue;
            dateMap.get(item._id).count = item.count;
        });

        expenseStats.forEach(item => {
            if (!dateMap.has(item._id)) dateMap.set(item._id, { revenue: 0, expenses: 0 });
            dateMap.get(item._id).expenses = item.amount;
        });

        // Convert map to array and sort
        const dates = Array.from(dateMap.keys()).sort();
        result = dates.map(date => ({
            label: date,
            date: date,
            revenue: dateMap.get(date).revenue || 0,
            expenses: dateMap.get(date).expenses || 0,
            count: dateMap.get(date).count || 0
        }));

    } else {
        // Evaluate monthly data
        result = Array.from({ length: 12 }, (_, i) => {
            const monthNum = i + 1;
            const revenueData = stats.find(item => item._id === monthNum);
            const expenseData = expenseStats.find(item => item._id === monthNum);
            
            return {
                label: new Date(0, i).toLocaleString('default', { month: 'short' }),
                month: monthNum,
                revenue: revenueData ? revenueData.revenue : 0,
                expenses: expenseData ? expenseData.amount : 0,
                count: revenueData ? revenueData.count : 0
            };
        });
    }

    res.status(200).json({
        success: true,
        data: result,
        meta: { 
            groupBy, 
            start, 
            end
        }
    });
});

// @desc    Get Payment Status Stats
// @route   GET /api/reports/payment-status
// @access  Private
const getPaymentStatusStats = asyncHandler(async (req, res) => {
    const baseQuery = getCompanyFilter(req);
    const { start, end } = getDateFilter(req.query);

    const matchQuery = { 
        ...baseQuery,
        billingDate: { $gte: start, $lte: end }
    };
    if (matchQuery.company) {
        matchQuery.company = new mongoose.Types.ObjectId(matchQuery.company);
    }

    const stats = await Billing.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$paymentStatus',
                count: { $sum: 1 },
                totalAmount: { $sum: '$grandTotal' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Get Contact-wise Billing
// @route   GET /api/reports/contact-billing
// @access  Private
const getContactBilling = asyncHandler(async (req, res) => {
    const baseQuery = getCompanyFilter(req);
    const { start, end } = getDateFilter(req.query);

    const matchQuery = { 
        ...baseQuery,
        billingDate: { $gte: start, $lte: end }
    };
    if (matchQuery.company) {
        matchQuery.company = new mongoose.Types.ObjectId(matchQuery.company);
    }

    const stats = await Billing.aggregate([
         { $match: matchQuery },
         {
             $group: {
                 _id: '$contact',
                 totalSpent: { $sum: '$grandTotal' },
                 invoiceCount: { $sum: 1 },
                 lastBilled: { $max: '$billingDate' }
             }
         },
         {
             $lookup: {
                 from: 'contacts',
                 localField: '_id',
                 foreignField: '_id',
                 as: 'contactDetails'
             }
         },
         { $unwind: '$contactDetails' },
         {
             $project: {
                 contactName: '$contactDetails.name',
                 companyName: '$contactDetails.companyName',
                 totalSpent: 1,
                 invoiceCount: 1,
                 lastBilled: 1
             }
         },
         { $sort: { totalSpent: -1 } },
         { $limit: 20 }
    ]);

    res.status(200).json({
        success: true,
        data: stats
    });
});

module.exports = {
    getServiceRevenue,
    getMonthlyTransactions,
    getPaymentStatusStats,
    getContactBilling
};
