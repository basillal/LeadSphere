const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');
const Service = require('../models/Service');
const Billing = require('../models/Billing');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const companyId = req.user.company?._id || req.user.company;
        const { startDate, endDate } = req.query;

        // Base Query
        const baseQuery = { company: companyId, isDeleted: false };
        const billingQuery = { company: companyId, paymentStatus: 'PAID' };

        // Apply Date Filter if provided
        if (startDate && endDate) {
            const dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
            
            baseQuery.createdAt = dateFilter;
            // For revenue, use billingDate or createdAt
            billingQuery.createdAt = dateFilter; 
        }

        // Parallel Execution
        const [
            leadCount,
            contactCount,
            activeServicesCount,
            activityCount,
            pendingActivitiesCount,
            leadsByStatus,
            activitiesByType,
            revenueData,
            recentActivities,
            topServices,
            pendingRevenueData,
            revenueTrend,
            leadTrend
        ] = await Promise.all([
            // 1. Quick Counts
            Lead.countDocuments(baseQuery),
            Contact.countDocuments(baseQuery),
            Service.countDocuments({ company: companyId, isDeleted: false, isActive: true }),
            Activity.countDocuments(baseQuery),
            Activity.countDocuments({ ...baseQuery, status: { $in: ['Scheduled', 'Pending'] } }),

            // 2. Leads by Status
            Lead.aggregate([
                { $match: baseQuery },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // 3. Activities by Type
            Activity.aggregate([
                { $match: baseQuery },
                { $group: { _id: '$activityType', count: { $sum: 1 } } }
            ]),

            // 4. Revenue Stats (Paid)
            Billing.aggregate([
                { $match: billingQuery },
                { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
            ]),

            // 5. Recent Activities
            Activity.find(baseQuery)
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('relatedId', 'name'),

            // 6. Top Services
            Billing.aggregate([
                { $match: billingQuery },
                { $unwind: '$items' },
                { $group: { 
                    _id: '$items.serviceName', 
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
                    count: { $sum: 1 }
                }},
                { $sort: { totalRevenue: -1 } },
                { $limit: 5 }
            ]),

            // 7. Pending Revenue (Total Unpaid)
            // Use paymentStatus !== 'PAID'
            Billing.aggregate([
                { $match: { company: companyId, paymentStatus: { $ne: 'PAID' } } },
                { $group: { _id: null, totalPending: { $sum: '$totalAmount' } } }
            ]),

            // 8. Revenue Trend (Last 12 Months)
            Billing.aggregate([
                { 
                  $match: { 
                    company: companyId, 
                    paymentStatus: 'PAID',
                    createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
                  } 
                },
                {
                  $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    totalRevenue: { $sum: "$totalAmount" }
                  }
                },
                { $sort: { _id: 1 } }
            ]),

            // 9. Lead Trend (Last 12 Months)
            Lead.aggregate([
                { 
                  $match: { 
                    company: companyId, 
                    isDeleted: false,
                    createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
                  } 
                },
                {
                  $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                  }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Process Revenue Data
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        const totalPendingRevenue = pendingRevenueData.length > 0 ? pendingRevenueData[0].totalPending : 0;

        console.log("Dashboard Stats Debug:", {
            revenueData,
            pendingRevenueData,
            revenueTrend,
            topServices,
            recentActivitiesCount: recentActivities.length,
            companyId
        });

        res.status(200).json({
            counts: {
                leads: leadCount,
                contacts: contactCount,
                services: activeServicesCount,
                activities: activityCount,
                pendingActivities: pendingActivitiesCount,
                revenue: totalRevenue,
                pendingRevenue: totalPendingRevenue
            },
            charts: {
                leadsByStatus,
                activitiesByType,
                topServices,
                revenueTrend,
                leadTrend
            },
            recentActivities
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};
