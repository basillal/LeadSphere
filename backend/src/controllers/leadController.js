const Lead = require('../models/Lead');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (TODO: Add Auth)
const getLeads = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filtering (Soft Delete Check)
    const query = { isDeleted: false };

    // Search by name/phone/email/company
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
            { name: searchRegex },
            { phone: searchRegex },
            { email: searchRegex },
            { companyName: searchRegex }
        ];
    }

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by source
    if (req.query.source) {
        query.source = req.query.source;
    }

    // Filter by Date Range (nextFollowUpDate)
    if (req.query.startDate || req.query.endDate) {
        query.nextFollowUpDate = {};
        if (req.query.startDate) {
            query.nextFollowUpDate.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            // Set end date to end of day if it's the same as start date or just a date string
             const end = new Date(req.query.endDate);
             end.setHours(23, 59, 59, 999);
            query.nextFollowUpDate.$lte = end;
        }
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: leads.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        },
        data: leads
    });
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) {
        res.status(404);
        throw new Error('Lead not found');
    }

    res.status(200).json({
        success: true,
        data: lead
    });
});

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
const createLead = asyncHandler(async (req, res) => {

    // Check if lead exists
    if (req.body.phone) {
        const leadExists = await Lead.findOne({ phone: req.body.phone, isDeleted: false });
        if (leadExists) {
            res.status(400);
            throw new Error('Lead with this phone number already exists');
        }
    }

    const lead = await Lead.create(req.body);

    logger.info(`New lead created: ${lead.name}`);

    res.status(201).json({
        success: true,
        data: lead
    });
});

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = asyncHandler(async (req, res) => {
    let lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) {
        res.status(404);
        throw new Error('Lead not found');
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: lead
    });
});

// @desc    Delete lead (Soft Delete)
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Soft delete
    lead.isDeleted = true;
    await lead.save();

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead
};
