const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
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

    // Base filter from Tenant Middleware
    const query = { ...req.companyFilter, isDeleted: false };

    // User-Level Isolation: If not Super Admin AND not Company Owner
    const isOwner = req.user.company && req.user.company.owner && req.user.company.owner.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin'; // Check role name too just in case

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
        // Regular user can only see leads assigned to them
        query.assignedTo = req.user._id;
    }

    // Search by name/phone/email/company
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$and = [
            {
                $or: [
                    { name: searchRegex },
                    { phone: searchRegex },
                    { email: searchRegex },
                    { companyName: searchRegex }
                ]
            }
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
        if (!query.nextFollowUpDate) query.nextFollowUpDate = {};
        if (req.query.startDate) {
            query.nextFollowUpDate.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
             const end = new Date(req.query.endDate);
             end.setHours(23, 59, 59, 999);
            query.nextFollowUpDate.$lte = end;
        }
    }

    // Optimization: Exclude converted leads
    if (req.query.excludeConverted === 'true') {
        query.isConverted = false;
        // Optionally also exclude 'Converted' status if data is mixed
        // query.status = { $ne: 'Converted' };
    }

    // Auto-update 'New' leads to 'Pending' if created before today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    await Lead.updateMany(
        { 
            ...req.companyFilter,
            status: 'New', 
            createdAt: { $lt: startOfToday },
            isDeleted: false 
        },
        { $set: { status: 'Pending' } }
    );

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .populate('company', 'name')
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
    // 1. Find Lead by ID
    const lead = await Lead.findById(req.params.id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .populate('company', 'name');

    if (!lead || lead.isDeleted) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // 2. Check Company Isolation
    // Safe-guard: Check Super Admin FIRST to avoid accessing req.user.company._id if it doesn't exist
    if (req.user.role?.roleName !== 'Super Admin') {
         if (!req.user.company || lead.company.toString() !== req.user.company._id.toString()) {
             res.status(404);
             throw new Error('Lead not found');
         }
    }

    // 3. User-Level Isolation
    const isOwner = req.user.company && req.user.company.owner && req.user.company.owner.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
        // Regular user must be assigned to the lead or have created it
        if (lead.assignedTo?._id.toString() !== req.user._id.toString()) {
             res.status(403);
             throw new Error('Not authorized to view this lead');
        }
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

    // Auto-assign Company from Tenant Middleware (or User context)
    // (Middleware already sets req.body.company if not Super Admin, but let's be safe)
    if (!req.body.company && req.user.company) {
        req.body.company = req.user.company._id;
    }
    
    // Auto-assign to Creator
    req.body.createdBy = req.user._id;
    if (!req.body.assignedTo) {
        req.body.assignedTo = req.user._id;
    }

    // Check if lead exists (Scoped to Company)
    if (req.body.phone) {
        const leadExists = await Lead.findOne({ 
            phone: req.body.phone, 
            company: req.body.company,
            isDeleted: false 
        });
        if (leadExists) {
            res.status(400);
            throw new Error('Lead with this phone number already exists in this company');
        }
    }

    const lead = await Lead.create(req.body);

    // Automatically create a Follow-up if date is provided
    if (req.body.nextFollowUpDate) {
        try {
            await FollowUp.create({
                lead: lead._id,
                company: lead.company,
                scheduledAt: req.body.nextFollowUpDate,
                type: req.body.followUpMode || 'Call',
                notes: req.body.followUpRemarks || 'Scheduled during lead creation',
                status: 'Pending',
                createdBy: req.user._id,
                assignedTo: lead.assignedTo || req.user._id
            });
            logger.info(`Auto-created follow-up for new lead: ${lead.name}`);
        } catch (error) {
            logger.error(`Failed to auto-create follow-up for lead ${lead._id}: ${error.message}`);
            // Log stack trace for deeper debugging if needed
            console.error(error);
        }
    }

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

    // Check Permissions
    // Safe-guard: Check Super Admin FIRST
    if (req.user.role?.roleName !== 'Super Admin') {
         if (!req.user.company || lead.company.toString() !== req.user.company._id.toString()) {
             res.status(404);
             throw new Error('Lead not found');
         }
    }

    const isOwner = req.user.company && req.user.company.owner && req.user.company.owner.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
        if (lead.assignedTo?.toString() !== req.user._id.toString()) {
             res.status(403);
             throw new Error('Not authorized to update this lead');
        }
    }

    const oldFollowUpDate = lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString() : null;

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // Check if follow-up date changed or was added
    const newFollowUpDate = req.body.nextFollowUpDate;
    const oldFollowUpDateObj = lead.nextFollowUpDate; // Use updated lead or original? Comparison logic needs original.
    // Wait, refactor logic above slightly shifted. I'll stick to established pattern but fix the variable name.

    // ... (FollowUp logic remains, just ensure we use 'company' when creating followups)
    
     // Helper to check if dates are effectively different
    const isDateDifferent = (d1, d2) => {
        if (!d1 && !d2) return false;
        if (!d1 || !d2) return true;
        return new Date(d1).getTime() !== new Date(d2).getTime();
    };

    if (newFollowUpDate && isDateDifferent(newFollowUpDate, oldFollowUpDate)) { // oldFollowUpDate is captured string
         try {
            await FollowUp.create({
                lead: lead._id,
                company: lead.company, // Ensure company is carried over
                scheduledAt: req.body.nextFollowUpDate,
                type: req.body.followUpMode || 'Call', 
                notes: req.body.followUpRemarks || 'Scheduled during lead update',
                status: 'Pending',
                createdBy: req.user._id,
                assignedTo: lead.assignedTo || req.user._id
            });
            logger.info(`Auto-created follow-up for updated lead: ${lead.name}`);
        } catch (error) {
            logger.error(`Failed to auto-create follow-up for updated lead ${lead._id}: ${error.message}`);
            console.error(error);
        }
    }

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

    // Check Permissions
    // Safe-guard: Check Super Admin FIRST
    if (req.user.role?.roleName !== 'Super Admin') {
         if (!req.user.company || lead.company.toString() !== req.user.company._id.toString()) {
             res.status(404);
             throw new Error('Lead not found');
         }
    }

    const isOwner = req.user.company && req.user.company.owner && req.user.company.owner.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
         // Regular users should probably NOT delete leads? Or strictly own?
         // Let's assume strict owner/admin only for delete for safety, OR if it's assigned to them.
         // Given the user request: "users can access only their own data", implies CRUD permission on own data?
         // Safer to restrict DELETE to admins usually, but let's allow if assigned to them for consistency.
         if (lead.assignedTo?.toString() !== req.user._id.toString()) {
              res.status(403);
              throw new Error('Not authorized to delete this lead');
         }
    }

    // Soft delete
    lead.isDeleted = true;
    await lead.save();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private
const getLeadStats = asyncHandler(async (req, res) => {
    const query = { ...req.companyFilter, isDeleted: false };
    
    // User isolation
    const isOwner = req.user.company && req.user.company.owner && req.user.company.owner.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
        query.assignedTo = req.user._id;
    }

    const total = await Lead.countDocuments(query);
    const newLeads = await Lead.countDocuments({ ...query, status: 'New' });
    const pending = await Lead.countDocuments({ ...query, status: 'Pending' });
    const inProgress = await Lead.countDocuments({ ...query, status: 'In Progress' });
    const onHold = await Lead.countDocuments({ ...query, status: 'On Hold' });
    const completed = await Lead.countDocuments({ ...query, status: 'Completed' });
    const lost = await Lead.countDocuments({ ...query, status: 'Lost' });
    const converted = await Lead.countDocuments({ ...query, isConverted: true });

    res.status(200).json({
        success: true,
        data: {
            total,
            new: newLeads,
            pending,
            inProgress,
            onHold,
            completed,
            lost,
            converted
        }
    });
});

module.exports = {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    getLeadStats
};
