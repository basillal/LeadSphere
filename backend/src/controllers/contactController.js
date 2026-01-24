const Contact = require('../models/Contact');
const Lead = require('../models/Lead');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
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

    const contact = await Contact.create(req.body);

    logger.info(`New contact created: ${contact.name}`);

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

    // Check if already converted
    const existingContact = await Contact.findOne({ leadId: req.params.leadId, isDeleted: false });
    if (existingContact) {
        res.status(400);
        throw new Error('Lead has already been converted to a contact');
    }

    // Check if phone already exists in contacts
    const phoneExists = await Contact.findOne({ phone: lead.phone, isDeleted: false });
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
        tags: req.body.tags || ['Client'], // Default tag or from request
        relationshipType: req.body.relationshipType || 'Business',
        createdBy: lead.createdBy
    };

    const contact = await Contact.create(contactData);

    // Update lead status to Converted
    lead.status = 'Converted';
    lead.convertedAt = new Date();
    lead.isConverted = true; // Flag to indicate this lead has been converted to contact
    await lead.save();

    logger.info(`Lead converted to contact: ${lead.name} -> ${contact.name}`);

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

    // If phone is being updated, check for duplicates
    if (req.body.phone && req.body.phone !== contact.phone) {
        const phoneExists = await Contact.findOne({ 
            phone: req.body.phone, 
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

    // Soft delete
    contact.isDeleted = true;
    await contact.save();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private
const getContactStats = asyncHandler(async (req, res) => {
    const query = { isDeleted: false };

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
