const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all follow-ups
// @route   GET /api/follow-ups
// @access  Private
const getFollowUps = asyncHandler(async (req, res) => {
    // Base filter from Tenant Middleware
    const query = { ...req.organizationFilter };

    // User-Level Isolation
    const isOwner = req.user && req.user.organization && req.user.organization?.owner?.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isOrganizationAdmin = req.user.role?.roleName === 'Organization Admin';

    if (!isSuperAdmin && !isOwner && !isOrganizationAdmin) {
        // Regular user can only see follow-ups assigned to them OR created by them
        query.$or = [
            { assignedTo: req.user._id },
            { createdBy: req.user._id }
        ];
    }

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by Date Range (today, upcoming, overdue)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (req.query.range === 'today') {
        query.scheduledAt = { $gte: todayStart, $lte: todayEnd };
    } else if (req.query.range === 'upcoming') {
        query.scheduledAt = { $gt: todayEnd };
    } else if (req.query.range === 'overdue') {
        query.scheduledAt = { $lt: todayStart };
        query.status = 'Pending'; 
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await FollowUp.countDocuments(query);

    // Include Lead details
    const followUps = await FollowUp.find(query)
        .populate('lead', 'name phone email organizationName status')
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .populate('organization', 'name')
        .sort({ scheduledAt: 1 })
        .skip(startIndex)
        .limit(limit);

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }
    pagination.pages = Math.ceil(total / limit);
    pagination.total = total;
    pagination.page = page;

    res.status(200).json({
        success: true,
        count: followUps.length,
        pagination,
        data: followUps
    });
});

// @desc    Create new follow-up
// @route   POST /api/follow-ups
// @access  Private
const createFollowUp = asyncHandler(async (req, res) => {
    const { lead, scheduledAt, type, notes } = req.body;

    // Verify lead exists
    const leadExists = await Lead.findById(lead);
    if (!leadExists) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Inject Organization & Creator
    if (!req.body.organization && req.user.organization) {
        req.body.organization = req.user.organization._id;
    }
    
    req.body.createdBy = req.user._id;

    // Optional: Auto-assign to self if not specified
    if (!req.body.assignedTo) {
        req.body.assignedTo = req.user._id;
    }

    const followUp = await FollowUp.create(req.body);
    
    // Update Lead Status if applicable
    const leadStatuses = ['New', 'Pending', 'In Progress', 'On Hold', 'Completed', 'Lost', 'Converted'];

    if (req.body.status) {
        req.body.status = req.body.status.trim();
    }

    if (leadStatuses.includes(req.body.status)) {
        leadExists.status = req.body.status;
        if (req.body.status === 'Converted') {
             leadExists.isConverted = true;
             leadExists.convertedAt = new Date();
        } else if (req.body.status === 'Lost') {
             leadExists.lostAt = new Date();
             leadExists.lostReason = req.body.outcome || 'Marked Lost via Follow-up';
        }
    }

    // Update the Lead's nextFollowUpDate and count
    leadExists.nextFollowUpDate = scheduledAt;
    leadExists.followUpCount = (leadExists.followUpCount || 0) + 1;
    await leadExists.save();

    logger.info(`Follow-up created for lead ${leadExists.name}, status synced: ${req.body.status}`);
    await logAudit(req, 'CREATE', 'FollowUp', followUp._id, `Created follow-up for lead: ${leadExists.name} (${req.body.type})`);

    res.status(201).json({
        success: true,
        data: followUp
    });
});

// @desc    Update follow-up
// @route   PUT /api/follow-ups/:id
// @access  Private
const updateFollowUp = asyncHandler(async (req, res) => {
    let followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
        res.status(404);
        throw new Error('Follow-up not found');
    }

    followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // Sync Status with Lead
    if (req.body.status) {
         req.body.status = req.body.status.trim();
         const leadStatuses = ['New', 'Pending', 'In Progress', 'On Hold', 'Completed', 'Lost', 'Converted'];
         if (leadStatuses.includes(req.body.status)) {
             try {
                 const lead = await Lead.findById(followUp.lead);
                 if (lead) {
                     lead.status = req.body.status;
                      if (req.body.status === 'Converted') {
                            lead.isConverted = true;
                            lead.convertedAt = new Date();
                        } else if (req.body.status === 'Lost') {
                            lead.lostAt = new Date();
                            lead.lostReason = followUp.outcome || req.body.outcome || 'Marked Lost via Follow-up Update';
                        }
                     await lead.save();
                     logger.info(`Lead status synced from follow-up update: ${lead.name} -> ${req.body.status}`);
                 }
             } catch (err) {
                 logger.error(`Failed to sync lead status from follow-up ${followUp._id}: ${err.message}`);
             }
         }
    }

    await logAudit(req, 'UPDATE', 'FollowUp', followUp._id, `Updated follow-up status: ${req.body.status || 'Updated details'}`);

    res.status(200).json({
        success: true,
        data: followUp
    });
});

// @desc    Delete follow-up
// @route   DELETE /api/follow-ups/:id
// @access  Private
const deleteFollowUp = asyncHandler(async (req, res) => {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
        res.status(404);
        throw new Error('Follow-up not found');
    }

    await logAudit(req, 'DELETE', 'FollowUp', followUp._id, 'Deleted follow-up');

    await followUp.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get follow-ups for specific lead
// @route   GET /api/leads/:leadId/follow-ups
// @access  Private
const getLeadFollowUps = asyncHandler(async (req, res) => {
    const followUps = await FollowUp.find({ lead: req.params.leadId })
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .populate('organization', 'name')
        .sort({ scheduledAt: -1 });

    res.status(200).json({
        success: true,
        count: followUps.length,
        data: followUps
    });
});


// @desc    Get follow-up statistics
// @route   GET /api/follow-ups/stats
// @access  Private
const getFollowUpStats = asyncHandler(async (req, res) => {
    // Base filter from Tenant Middleware
    const query = { ...req.organizationFilter };

    // User-Level Isolation (Same logic as getFollowUps)
    const isOwner = req.user && req.user.organization && req.user.organization?.owner?.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isOrganizationAdmin = req.user.role?.roleName === 'Organization Admin';

    if (!isSuperAdmin && !isOwner && !isOrganizationAdmin) {
        query.$or = [
            { assignedTo: req.user._id },
            { createdBy: req.user._id }
        ];
    }

    // Date Ranges
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Aggregation
    const stats = await FollowUp.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                pending: {
                    $sum: {
                        $cond: [
                            { 
                                $and: [
                                    { $eq: ["$status", "Pending"] },
                                    { $gte: ["$scheduledAt", todayStart] },
                                    { $lte: ["$scheduledAt", todayEnd] }
                                ] 
                            }, 
                            1, 
                            0
                        ]
                    }
                },
                completed: {
                    $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                },
                missed: {
                    $sum: {
                        $cond: [
                            { 
                                $and: [
                                    { $ne: ["$status", "Completed"] },
                                    { $lt: ["$scheduledAt", todayStart] }
                                ] 
                            }, 
                            1, 
                            0
                        ]
                    }
                }
            }
        }
    ]);

    const result = stats.length > 0 ? stats[0] : { total: 0, pending: 0, completed: 0, missed: 0 };
    delete result._id;

    res.status(200).json({
        success: true,
        data: result
    });
});

module.exports = {
    getFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    getLeadFollowUps,
    getFollowUpStats
};
