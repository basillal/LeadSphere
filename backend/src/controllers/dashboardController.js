const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');
const Service = require('../models/Service');
const Billing = require('../models/Billing');
const Expense = require('../models/Expense');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Base Query using tenant filter
        // req.companyFilter is set by tenantMiddleware
        // Example: { company: 'ObjectId', isDeleted: false } or just { isDeleted: false } for SuperAdmin global view
        const baseQuery = req.companyFilter ? { ...req.companyFilter, isDeleted: false } : { isDeleted: false };
        
        // Ensure company is ObjectId for Aggregation (important!)
        if (baseQuery.company) {
            baseQuery.company = new mongoose.Types.ObjectId(baseQuery.company);
        }

        const billingQuery = { ...baseQuery, paymentStatus: 'PAID' };
        
        // Ensure company is ObjectId for billingQuery aggregation too
        if (billingQuery.company) {
             billingQuery.company = new mongoose.Types.ObjectId(billingQuery.company);
        }

        const companyId = baseQuery.company; // For reference in code logic if needed

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
            leadTrend,
            conversionData,
            recentLeads,
            expenseTrend,
            leadsBySource,
            totalExpenses,
            totalInvoices,
            totalUsers
        ] = await Promise.all([
            // 1. Quick Counts
            Lead.countDocuments(baseQuery),
            Contact.countDocuments(baseQuery),
            Service.countDocuments({ ...baseQuery, isActive: true }),
            Activity.countDocuments(baseQuery),
            Activity.countDocuments({ ...baseQuery, status: { $in: ['Scheduled', 'Pending', 'In Progress'] } }),

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
                { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
            ]),

            // 5. Recent Activities
            Activity.find(baseQuery)
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('relatedId', 'name'),

            // 6. Top Services
            Billing.aggregate([
                { $match: billingQuery },
                { $unwind: '$services' },
                { $group: { 
                    _id: '$services.serviceName', 
                    totalRevenue: { $sum: '$services.totalAmount' },
                    count: { $sum: 1 }
                }},
                { $sort: { totalRevenue: -1 } },
                { $limit: 5 }
            ]),

            // 7. Pending Revenue (Total Unpaid)
            // Use paymentStatus !== 'PAID'
            Billing.aggregate([
                { $match: { ...baseQuery, paymentStatus: { $ne: 'PAID' } } },
                { $group: { _id: null, totalPending: { $sum: '$grandTotal' } } }
            ]),

            // 8. Revenue Trend
            (() => {
                const interval = req.query.revenueInterval || 'daily'; // daily, monthly, yearly
                let format = "%Y-%m-%d";
                let startDateFilter = new Date();
                
                if (interval === 'daily') {
                    format = "%Y-%m-%d";
                    startDateFilter.setDate(startDateFilter.getDate() - 30); // Last 30 days
                } else if (interval === 'monthly') {
                    format = "%Y-%m";
                    startDateFilter.setFullYear(startDateFilter.getFullYear() - 1); // Last 12 months
                } else if (interval === 'yearly') {
                    format = "%Y";
                    startDateFilter.setFullYear(startDateFilter.getFullYear() - 5); // Last 5 years
                }

                return Billing.aggregate([
                    { 
                      $match: { 
                        ...baseQuery,
                        paymentStatus: 'PAID',
                        // Use billingDate for filtering
                        billingDate: baseQuery.billingDate ? baseQuery.billingDate : { $gte: startDateFilter }
                      } 
                    },
                    {
                      $group: {
                        // Group by billingDate
                        _id: { $dateToString: { format: format, date: "$billingDate" } },
                        totalRevenue: { $sum: "$grandTotal" }
                      }
                    },
                    { $sort: { _id: 1 } }
                ]);
            })(),

            // 9. Lead Trend (Last 12 Months)
            Lead.aggregate([
                { 
                  $match: { 
                    ...baseQuery,
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
            ]),

            // 10. Win Rate / Conversion Rate
            Lead.aggregate([
                { $match: baseQuery },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        won: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } } 
                    }
                }
            ]),

            // 11. Recent Leads
            Lead.find(baseQuery)
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name status source createdAt email phone'),

            // 13. Expense Trend (Matches Revenue Trend Logic)
            (() => {
                const interval = req.query.revenueInterval || 'daily'; // Reuse same interval? Or separate? Let's reuse for now.
                let format = "%Y-%m-%d";
                let startDateFilter = new Date();
                
                if (interval === 'daily') {
                    format = "%Y-%m-%d";
                    startDateFilter.setDate(startDateFilter.getDate() - 30);
                } else if (interval === 'monthly') {
                    format = "%Y-%m";
                    startDateFilter.setFullYear(startDateFilter.getFullYear() - 1);
                } else if (interval === 'yearly') {
                    format = "%Y";
                    startDateFilter.setFullYear(startDateFilter.getFullYear() - 5);
                }

                // If explicit date range provided in query, override
                 let dateQuery = baseQuery.createdAt ? baseQuery.createdAt : { $gte: startDateFilter };
                 // Expense date field is 'expenseDate'
                 if (startDate && endDate) {
                     dateQuery = { $gte: new Date(startDate), $lte: new Date(endDate) };
                 }

                return Expense.aggregate([
                    { 
                      $match: { 
                        ...baseQuery,
                        expenseDate: dateQuery
                      } 
                    },
                    {
                      $group: {
                        _id: { $dateToString: { format: format, date: "$expenseDate" } },
                        totalExpenses: { $sum: "$amount" }
                      }
                    },
                    { $sort: { _id: 1 } }
                ]);
            })(),

            // 12. Leads by Source
            Lead.aggregate([
                { $match: baseQuery },
                { $group: { _id: '$source', count: { $sum: 1 } } }
            ]),

            // 15. Total Expenses (Scalar)
            Expense.aggregate([
                { $match: baseQuery },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // 16. Total Invoices (Count)
            Billing.countDocuments(baseQuery),

            // 17. Total Users (Count)
            User.countDocuments(baseQuery)
        ]);

        // Process Total Expenses
        const processedTotalExpenses = totalExpenses.length > 0 ? totalExpenses[0].total : 0;

        // Process Revenue Data
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        const totalPendingRevenue = pendingRevenueData.length > 0 ? pendingRevenueData[0].totalPending : 0;
        
        // Process Conversion Rate
        const totalLeads = conversionData.length > 0 ? conversionData[0].total : 0;
        const wonLeads = conversionData.length > 0 ? conversionData[0].won : 0;
        const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

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
                pendingRevenue: totalPendingRevenue,
                pendingRevenue: totalPendingRevenue,
                conversionRate,
                totalExpenses: processedTotalExpenses,
                invoices: totalInvoices,
                users: totalUsers
            },
            charts: {
                leadsByStatus,
                activitiesByType,
                topServices,
                revenueTrend,
                expenseTrend,
                leadTrend,
                leadsBySource
            },
            recentActivities,
            recentLeads
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};

