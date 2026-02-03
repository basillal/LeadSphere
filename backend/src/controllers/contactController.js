const Contact = require('../models/Contact');
const Lead = require('../models/Lead');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Base filter from Tenant Middleware
    // Ensure req.companyFilter exists (middleware should handle this, but if missing, default empty safe?)
    // If middleware is missing, this is empty.
    const query = { ...(req.companyFilter || {}), isDeleted: false };

    // User-Level Isolation: If not Super Admin AND not Company Owner
    // Safe check for req.user
    if (!req.user) {
        // Should be caught by auth middleware, but just in case
        res.status(401);
        throw new Error('User not authenticated (Controller Assert)');
    }

    const isOwner = req.user && req.user.company && req.user.company?.owner?.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
        // Regular user can only see contacts assigned to them or created by them
        query.createdBy = req.user._id;
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

    // Filter by tags
    if (req.query.tag) {
        query.tags = req.query.tag;
    }

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by relationship type
    if (req.query.relationshipType) {
        query.relationshipType = req.query.relationshipType;
    }

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
        .populate('leadId', 'name')
        .populate('createdBy', 'name')
        .populate('company', 'name')
        .sort({ lastInteractionDate: -1, createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: contacts.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        },
        data: contacts
    });
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
const getContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id).populate('leadId');

    if (!contact || contact.isDeleted) {
        res.status(404);
        throw new Error('Contact not found');
    }
    
    // Check Permissions (Tenant Isolation)
    if (req.user.role?.roleName !== 'Super Admin') {
         if (!req.user.company || (contact.company && contact.company.toString() !== req.user.company._id.toString())) {
             res.status(404);
             throw new Error('Contact not found');
         }
    }

    res.status(200).json({
        success: true,
        data: contact
    });
});

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
const createContact = asyncHandler(async (req, res) => {
    // Check if contact exists
    if (req.body.phone) {
        const contactExists = await Contact.findOne({ phone: req.body.phone, isDeleted: false });
        if (contactExists) {
            res.status(400);
            throw new Error('Contact with this phone number already exists');
        }
    }

    // Inject Company & Creator
    // Safe-guard: Check if company exists on user
    if (!req.body.company && req.user.company) {
        req.body.company = req.user.company._id || req.user.company; 
    }
    req.body.createdBy = req.user._id;

    const contact = await Contact.create(req.body);

    logger.info(`New contact created: ${contact.name}`);
    await logAudit(req, 'CREATE', 'Contact', contact._id, `Created contact: ${contact.name}`);

    res.status(201).json({
        success: true,
        data: contact
    });
});

// @desc    Convert lead to contact
// @route   POST /api/contacts/convert/:leadId
// @access  Private
const convertLeadToContact = asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.leadId);

    if (!lead || lead.isDeleted) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Check Tenant Permission
    if (req.user.role?.roleName !== 'Super Admin') {
         if (!req.user.company || lead.company.toString() !== req.user.company._id.toString()) {
             res.status(404);
             throw new Error('Lead not found');
         }
    }

    // Check if already converted
    const existingContact = await Contact.findOne({ leadId: req.params.leadId, isDeleted: false });
    if (existingContact) {
        res.status(400);
        throw new Error('Lead has already been converted to a contact');
    }

    // Check if phone already exists in contacts
    const phoneExists = await Contact.findOne({ phone: lead.phone, company: lead.company, isDeleted: false });
    if (phoneExists) {
        res.status(400);
        throw new Error('A contact with this phone number already exists');
    }

    // Create contact from lead data
    const contactData = {
        leadId: lead._id,
        convertedFrom: 'Lead',
        name: lead.name,
        phone: lead.phone,
        alternatePhone: lead.alternatePhone,
        email: lead.email,
        companyName: lead.companyName,
        designation: lead.designation,
        website: lead.website,
        preferredContactMode: lead.preferredContactMode,
        preferredContactTime: lead.preferredContactTime,
        doNotDisturb: lead.doNotDisturb,
        notes: lead.notes,
        internalComments: lead.internalComments,
        attachments: lead.attachments,
        lastInteractionDate: lead.lastContactedAt || new Date(),
        nextFollowUpDate: lead.nextFollowUpDate,
        tags: req.body.tags || ['Client'], 
        relationshipType: req.body.relationshipType || 'Business',
        createdBy: lead.createdBy || req.user._id,
        company: lead.company 
    };
    
    const contact = await Contact.create(contactData);

    // Update lead status to Converted
    lead.status = 'Converted';
    lead.convertedAt = new Date();
    lead.isConverted = true; 
    await lead.save();

    logger.info(`Lead converted to contact: ${lead.name} -> ${contact.name}`);
    await logAudit(req, 'CREATE', 'Contact', contact._id, `Converted Lead to Contact: ${lead.name}`);
    await logAudit(req, 'UPDATE', 'Lead', lead._id, `Marked lead as Converted`);

    res.status(201).json({
        success: true,
        data: contact,
        message: 'Lead successfully converted to contact'
    });
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = asyncHandler(async (req, res) => {
    let contact = await Contact.findById(req.params.id);

    if (!contact || contact.isDeleted) {
        res.status(404);
        throw new Error('Contact not found');
    }

    // Check Permissions
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    if (!isSuperAdmin) {
        // Must belong to user's company
        if (!req.user.company || (contact.company && contact.company.toString() !== req.user.company._id.toString())) {
            res.status(404);
            throw new Error('Contact not found');
        }
    }

    // Check User-level isolation if applied
    const isOwner = req.user.company && req.user.company?.owner?.toString() === req.user._id.toString();
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
         if (contact.createdBy?.toString() !== req.user._id.toString()) {
              res.status(403);
              throw new Error('Not authorized to update this contact');
         }
    }

    // If phone is being updated, check for duplicates
    if (req.body.phone && req.body.phone !== contact.phone) {
        const phoneExists = await Contact.findOne({ 
            phone: req.body.phone, 
            company: contact.company,
            isDeleted: false,
            _id: { $ne: req.params.id }
        });
        if (phoneExists) {
            res.status(400);
            throw new Error('A contact with this phone number already exists');
        }
    }

    contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    await logAudit(req, 'UPDATE', 'Contact', contact._id, `Updated contact: ${contact.name}`);

    res.status(200).json({
        success: true,
        data: contact
    });
});

// @desc    Delete contact (Soft Delete)
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact || contact.isDeleted) {
        res.status(404);
        throw new Error('Contact not found');
    }

    // Check Permissions
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    if (!isSuperAdmin) {
        if (!req.user.company || (contact.company && contact.company.toString() !== req.user.company._id.toString())) {
            res.status(404);
            throw new Error('Contact not found');
        }
    }

    const isOwner = req.user.company && req.user.company?.owner?.toString() === req.user._id.toString();
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
         if (contact.createdBy?.toString() !== req.user._id.toString()) {
              res.status(403);
              throw new Error('Not authorized to delete this contact');
         }
    }

    // Soft delete
    contact.isDeleted = true;
    await contact.save();

    // Revert Lead Conversion Status if applicable
    if (contact.leadId) {
        try {
            const lead = await Lead.findById(contact.leadId);
            if (lead) {
                lead.isConverted = false;
                lead.status = 'Completed'; // Revert to Completed so it can be converted again
                // lead.convertedAt = null; // Optional: Keep history or clear it? Keeping it might be confusing if converted again. let's clear it.
                // Actually, let's keep convertedAt as "last converted at" or just leave it. 
                // Simplest is just set isConverted to false so it shows up in the list again.
                await lead.save();
                logger.info(`Reverted conversion status for lead: ${lead.name} after contact deletion`);
                // Audit the revert too?
                await logAudit(req, 'UPDATE', 'Lead', lead._id, `Reverted conversion status (Contact deleted)`);
            }
        } catch (err) {
            logger.error(`Failed to revert lead conversion status for contact ${contact._id}: ${err.message}`);
        }
    }

    await logAudit(req, 'DELETE', 'Contact', contact._id, `Soft deleted contact: ${contact.name}`);

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private
const getContactStats = asyncHandler(async (req, res) => {
    // IMPORTANT: Use Company Filter!
    // Safe check if companyFilter exists
    const query = { ...(req.companyFilter || {}), isDeleted: false }; 

    // Additional User Isolation if not Super Admin/Owner
    const isOwner = req.user.company && req.user.company?.owner?.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isCompanyAdmin = req.user.role?.roleName === 'Company Admin';

    if (!isSuperAdmin && !isOwner && !isCompanyAdmin) {
        query.createdBy = req.user._id;
    }

    const total = await Contact.countDocuments(query);
    const clients = await Contact.countDocuments({ ...query, tags: 'Client' });
    const vendors = await Contact.countDocuments({ ...query, tags: 'Vendor' });
    const partners = await Contact.countDocuments({ ...query, tags: 'Partner' });
    const friends = await Contact.countDocuments({ ...query, tags: 'Friend' });

    // Recent interactions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentInteractions = await Contact.countDocuments({
        ...query,
        lastInteractionDate: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
        success: true,
        data: {
            total,
            clients,
            vendors,
            partners,
            friends,
            recentInteractions
        }
    });
});

module.exports = {
    getContacts,
    getContact,
    createContact,
    convertLeadToContact,
    updateContact,
    deleteContact,
    getContactStats
};
