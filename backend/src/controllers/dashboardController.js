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
        // req.organizationFilter is set by tenantMiddleware
        // Example: { organization: 'ObjectId', isDeleted: false } or just { isDeleted: false } for SuperAdmin global view
        const baseQuery = req.organizationFilter ? { ...req.organizationFilter, isDeleted: false } : { isDeleted: false };
        
        // Ensure organization is ObjectId for Aggregation (important!)
        if (baseQuery.organization) {
            baseQuery.organization = new mongoose.Types.ObjectId(baseQuery.organization);
        }

        // Specific Queries for different models
        const leadQuery = { ...baseQuery };
        const contactQuery = { ...baseQuery };
        const activityQuery = { ...baseQuery };
        const revenueQuery = { ...baseQuery, paymentStatus: 'PAID' }; // For Revenue
        const pendingQuery = { ...baseQuery, paymentStatus: { $ne: 'PAID' } }; // For Pending
        const expenseQuery = { ...baseQuery };
        const invoiceCountQuery = { ...baseQuery };
        const serviceQuery = { ...baseQuery, isActive: true };

        // Apply Date Filter if provided
        if (startDate && endDate) {
            const dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
            
            leadQuery.createdAt = dateFilter;
            contactQuery.createdAt = dateFilter;
            
            // Activity uses activityDate
            activityQuery.activityDate = dateFilter;
            
            // Billing uses billingDate
            revenueQuery.billingDate = dateFilter;
            pendingQuery.billingDate = dateFilter;
            invoiceCountQuery.billingDate = dateFilter;
            
            // Expense uses expenseDate
            expenseQuery.expenseDate = dateFilter;
            
            // Service usually doesn't need date filter for "Active Services", 
            // but if we want "Services created in this period", use createdAt.
            // Dashboard usually shows CURRENT active services count, regardless of creation.
            // So we generally DON'T filter services by date unless requested. 
            // Let's keep serviceQuery without date filter for "Active Services Snapshot"
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
            Lead.countDocuments(leadQuery),
            Contact.countDocuments(contactQuery),
            Service.countDocuments(serviceQuery),
            Activity.countDocuments(activityQuery),
            Activity.countDocuments({ ...activityQuery, status: { $in: ['Scheduled', 'Pending', 'In Progress'] } }),

            // 2. Leads by Status
            Lead.aggregate([
                { $match: leadQuery },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            // 3. Activities by Type
            Activity.aggregate([
                { $match: activityQuery },
                { $group: { _id: '$activityType', count: { $sum: 1 } } }
            ]),

            // 4. Revenue Stats (Paid)
            Billing.aggregate([
                { $match: revenueQuery },
                { $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }
            ]),

            // 5. Recent Activities
            Activity.find(baseQuery) // Recent activities logs usually show EVERYTHING recent, not just in filtered range? 
                // Actually if I filter "Last 30 days", show recent from last 30 days.
                // But typically "Recent" means "Most recently created globally".
                // Let's use activityQuery to be consistent with the view.
                .find(activityQuery)
                .sort({ activityDate: -1 }) // Sort by activityDate
                .limit(5)
                .populate('relatedId', 'name'),

            // 6. Top Services (Revenue based)
            Billing.aggregate([
                { $match: revenueQuery },
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
            Billing.aggregate([
                { $match: pendingQuery },
                { $group: { _id: null, totalPending: { $sum: '$grandTotal' } } }
            ]),

            // 8. Financial Trend (Revenue, Expenses, Pending)
             (() => {
                const interval = req.query.revenueInterval || 'daily';
                let format = "%Y-%m-%d";
                let defaultStart = new Date();
                
                if (interval === 'daily') {
                    format = "%Y-%m-%d";
                    defaultStart.setDate(defaultStart.getDate() - 30);
                } else if (interval === 'monthly') {
                    format = "%Y-%m";
                    defaultStart.setFullYear(defaultStart.getFullYear() - 1);
                } else if (interval === 'yearly') {
                    format = "%Y";
                    defaultStart.setFullYear(defaultStart.getFullYear() - 5);
                }

                // If explicit date range provided in query, override defaultStart
                // BUT keep the "Trend" logic which groups by date.
                // We must apply the SAME date filter as the main dashboard if provided.
                
                let dateMatch = { $gte: defaultStart };
                if (startDate && endDate) {
                    dateMatch = { $gte: new Date(startDate), $lte: new Date(endDate) };
                }

                const trendRevenueQuery = { ...baseQuery, paymentStatus: 'PAID', billingDate: dateMatch };
                const trendPendingQuery = { ...baseQuery, paymentStatus: { $in: ['PENDING', 'OVERDUE'] }, billingDate: dateMatch };
                const trendExpenseQuery = { ...baseQuery, expenseDate: dateMatch };

                const revenuePromise = Billing.aggregate([
                    { $match: trendRevenueQuery },
                    { $group: { _id: { $dateToString: { format: format, date: "$billingDate" } }, total: { $sum: "$grandTotal" } } }
                ]);

                const expensePromise = Expense.aggregate([
                    { $match: trendExpenseQuery },
                    { $group: { _id: { $dateToString: { format: format, date: "$expenseDate" } }, total: { $sum: "$amount" } } }
                ]);

                const pendingPromise = Billing.aggregate([
                     { $match: trendPendingQuery },
                     { $group: { _id: { $dateToString: { format: format, date: "$billingDate" } }, total: { $sum: "$grandTotal" } } }
                ]);

                return Promise.all([revenuePromise, expensePromise, pendingPromise]).then(([rev, exp, pen]) => {
                    const map = new Map();
                    
                    const addToMap = (arr, key) => {
                        arr.forEach(item => {
                            if (!item._id) return; // safety
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

            // 9. Lead Trend (Last 12 Months OR filtered range)
            Lead.aggregate([
                { 
                  $match: leadQuery // Use the leadQuery which already has createdAt filter if applied
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
                { $match: leadQuery },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        won: { $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } } 
                    }
                }
            ]),

            // 11. Recent Leads
            Lead.find(leadQuery)
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name status source createdAt email phone'),

            // 12. Leads by Source
            Lead.aggregate([
                { $match: leadQuery },
                { $group: { _id: '$source', count: { $sum: 1 } } }
            ]),

            // 13. Total Expenses (Scalar)
            Expense.aggregate([
                { $match: expenseQuery },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),

            // 14. Total Invoices (Count)
            Billing.countDocuments(invoiceCountQuery),

            // 15. Total Users (Count)
            User.countDocuments(baseQuery) // Users usually not filtered by date on dashboard
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

