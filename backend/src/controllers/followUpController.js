const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');

// @desc    Get all follow-ups
// @route   GET /api/follow-ups
// @access  Private
const getFollowUps = asyncHandler(async (req, res) => {
    // Base filter from Tenant Middleware
    const query = { ...req.companyFilter };

    // User-Level Isolation
    const isOwner = req.user && req.user.company && req.user.company?.owner?.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
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

    // Include Lead details
    const followUps = await FollowUp.find(query)
        .populate('lead', 'name phone email companyName status')
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .sort({ scheduledAt: 1 });

    res.status(200).json({
        success: true,
        count: followUps.length,
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

    // Inject Company & Creator
    if (!req.body.company && req.user.company) {
        req.body.company = req.user.company._id;
    }
    // If Super Admin creates a lead/followup without company context, it might fail validation if company is required.
    // Ensure we handle that if needed, but for now assuming Super Admin has a way or just doesn't create "orphaned" followups often.
    
    req.body.createdBy = req.user._id;

    // Optional: Auto-assign to self if not specified
    if (!req.body.assignedTo) {
        req.body.assignedTo = req.user._id;
    }

    const followUp = await FollowUp.create(req.body);
    
    // Optionally update the Lead's nextFollowUpDate and count
    leadExists.nextFollowUpDate = scheduledAt;
    leadExists.followUpCount = (leadExists.followUpCount || 0) + 1;
    await leadExists.save();

    logger.info(`Follow-up created for lead ${leadExists.name}`);

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
        .sort({ scheduledAt: -1 });

    res.status(200).json({
        success: true,
        count: followUps.length,
        data: followUps
    });
});


module.exports = {
    getFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    getLeadFollowUps
};
