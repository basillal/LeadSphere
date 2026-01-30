const Billing = require('../models/Billing');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Helper to get company filter
const getCompanyFilter = (req) => {
    return req.companyFilter ? { ...req.companyFilter, isDeleted: false } : { isDeleted: false };
};

// @desc    Get Revenue by Service
// @route   GET /api/reports/service-revenue
// @access  Private
const getServiceRevenue = asyncHandler(async (req, res) => {
    const baseQuery = getCompanyFilter(req);
    // REMOVED: const companyId = req.user.company?._id || req.user.company;
    // We already have the correct company filter in baseQuery (either from user or header context)
    // baseQuery looks like: { company: '...', isDeleted: false }

    // Ensure company ID is ObjectId in match
    const matchQuery = { ...baseQuery };
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
const getMonthlyTransactions = asyncHandler(async (req, res) => {
    const baseQuery = getCompanyFilter(req);
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const matchQuery = { ...baseQuery };
    if (matchQuery.company) {
        matchQuery.company = new mongoose.Types.ObjectId(matchQuery.company);
    }

    const monthlyStats = await Billing.aggregate([
        { 
            $match: { 
                ...matchQuery,
                billingDate: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            } 
        },
        {
            $group: {
                _id: { $month: '$billingDate' },
                revenue: { $sum: '$grandTotal' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    // Fill in missing months
    const result = Array.from({ length: 12 }, (_, i) => {
        const monthData = monthlyStats.find(item => item._id === i + 1);
        return {
            month: i + 1,
            monthName: new Date(0, i).toLocaleString('default', { month: 'short' }),
            revenue: monthData ? monthData.revenue : 0,
            count: monthData ? monthData.count : 0
        };
    });

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get Payment Status Stats
// @route   GET /api/reports/payment-status
// @access  Private
const getPaymentStatusStats = asyncHandler(async (req, res) => {
    const baseQuery = getCompanyFilter(req);

    const matchQuery = { ...baseQuery };
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

    const matchQuery = { ...baseQuery };
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
