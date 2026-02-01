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
            financialTrend,
            leadTrend,
            conversionData,
            recentLeads,
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

            // 8. Financial Trend (Revenue, Expenses, Pending)
            (() => {
                const interval = req.query.revenueInterval || 'daily';
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
                let dateFilter = { $gte: startDateFilter };
                if (startDate && endDate) {
                    dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
                }

                // We need to aggregate Revenue (Billing PAID), Expenses, and Pending (Billing PENDING)
                // Since they are in different collections (Billing vs Expense), we run 3 parallel aggregations
                // and then merge them in memory.
                
                const revenuePromise = Billing.aggregate([
                    { $match: { ...baseQuery, paymentStatus: 'PAID', billingDate: dateFilter } },
                    { $group: { _id: { $dateToString: { format: format, date: "$billingDate" } }, total: { $sum: "$grandTotal" } } }
                ]);

                const expensePromise = Expense.aggregate([
                    { $match: { ...baseQuery, expenseDate: dateFilter } },
                    { $group: { _id: { $dateToString: { format: format, date: "$expenseDate" } }, total: { $sum: "$amount" } } }
                ]);

                const pendingPromise = Billing.aggregate([
                     { $match: { ...baseQuery, paymentStatus: { $in: ['PENDING', 'OVERDUE'] }, billingDate: dateFilter } },
                     { $group: { _id: { $dateToString: { format: format, date: "$billingDate" } }, total: { $sum: "$grandTotal" } } }
                ]);

                return Promise.all([revenuePromise, expensePromise, pendingPromise]).then(([rev, exp, pen]) => {
                    const map = new Map();
                    
                    const addToMap = (arr, key) => {
                        arr.forEach(item => {
                            if (!map.has(item._id)) map.set(item._id, { _id: item._id, totalRevenue: 0, totalExpenses: 0, totalPending: 0 });
                            map.get(item._id)[key] = item.total;
                        });
                    };

                    addToMap(rev, 'totalRevenue');
                    addToMap(exp, 'totalExpenses');
                    addToMap(pen, 'totalPending');

                    return Array.from(map.values()).sort((a, b) => a._id.localeCompare(b._id));
                });
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

            // 12. Leads by Source
            Lead.aggregate([
                { $match: baseQuery },
                { $group: { _id: '$source', count: { $sum: 1 } } }
            ]),

            // 13. Total Expenses (Scalar)
            Expense.aggregate([
                { $match: baseQuery },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // 14. Total Invoices (Count)
            Billing.countDocuments(baseQuery),

            // 15. Total Users (Count)
            User.countDocuments(baseQuery)
        ]);



        const processedTotalExpenses = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        const totalPendingRevenue = pendingRevenueData.length > 0 ? pendingRevenueData[0].totalPending : 0;
        
        const totalLeads = conversionData.length > 0 ? conversionData[0].total : 0;
        const wonLeads = conversionData.length > 0 ? conversionData[0].won : 0;
        const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

        res.status(200).json({
            counts: {
                leads: leadCount,
                contacts: contactCount,
                services: activeServicesCount,
                activities: activityCount,
                pendingActivities: pendingActivitiesCount,
                revenue: totalRevenue,
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
                financialTrend, // New Combined Chart Data
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

