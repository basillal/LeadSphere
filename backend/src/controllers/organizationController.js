const Organization = require('../models/Organization');
const User = require('../models/User');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const Referrer = require('../models/Referrer');
const Role = require('../models/Role');
const Service = require('../models/Service');
const Billing = require('../models/Billing');
const Expense = require('../models/Expense');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Super Admin
const getOrganizations = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
        query.name = new RegExp(req.query.search, 'i');
    }

    const total = await Organization.countDocuments(query);
    const organizations = await Organization.find(query)
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: organizations.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        },
        data: organizations
    });
});

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Super Admin (or Organization Admin for their own)
const getOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id).populate('owner', 'name email');

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }

    // Access Check: Super Admin OR Owner
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isOwner = req.user.organization?._id.toString() === organization._id.toString();

    if (!isSuperAdmin && !isOwner) {
        res.status(403);
        throw new Error('Not authorized to view this organization');
    }

    res.status(200).json({
        success: true,
        data: organization
    });
});

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Super Admin
const createOrganization = asyncHandler(async (req, res) => {
    const { 
        name, ownerEmail, ownerName, plan, settings,
        description, phone, email, website, address, logo 
    } = req.body;

    if (!name || !ownerEmail) {
        res.status(400);
        throw new Error('Organization name and Owner email are required');
    }

    // 1. Check if owner user exists
    let owner = await User.findOne({ email: ownerEmail });
    
    // Prepare settings object (merge provided settings with logo if present)
    const organizationSettings = { ...settings };
    if (logo) organizationSettings.logo = logo;

    // 2. Create Organization
    const organization = await Organization.create({
        name,
        plan: plan || 'Free',
        settings: organizationSettings,
        description,
        phone,
        email, 
        website,
        address,
        owner: owner ? owner._id : new mongoose.Types.ObjectId() // Placeholder if creating new user
    });

    // 3. If User doesn't exist, create them (with a default password to be changed)
    let isNewUser = false;
    const organizationAdminRole = await require('../models/Role').findOne({ roleName: 'Organization Admin' });

    if (!owner) {
        isNewUser = true;
        owner = await User.create({
            name: ownerName || 'Admin',
            email: ownerEmail,
            password: 'Password123!', // Temporary password
            organization: organization._id,
            role: organizationAdminRole ? organizationAdminRole._id : null
        });
        
        // Update organization with real owner ID
        organization.owner = owner._id;
        await organization.save();
    } else {
        if (owner.organization) {
             // Rollback
             await organization.deleteOne();
             res.status(400);
             throw new Error('User already belongs to a organization');
        }
        owner.organization = organization._id;
        if (organizationAdminRole) {
            owner.role = organizationAdminRole._id; 
        }
        await owner.save();
    }

    logger.info(`New organization created: ${organization.name} by ${req.user.name}`);
    await logAudit(req, 'CREATE', 'Organization', organization._id, `Created organization: ${organization.name}`);

    res.status(201).json({
        success: true,
        data: organization,
        owner: {
            id: owner._id,
            email: owner.email,
            isNewUser,
            tempPassword: isNewUser ? 'Password123!' : undefined
        }
    });
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Super Admin or Organization Owner
const updateOrganization = asyncHandler(async (req, res) => {
    let organization = await Organization.findById(req.params.id);

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }

    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isOwner = req.user.organization?._id.toString() === organization._id.toString();

    if (!isSuperAdmin && !isOwner) {
        res.status(403);
        throw new Error('Not authorized');
    }

    organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    await logAudit(req, 'UPDATE', 'Organization', organization._id, `Updated organization settings: ${organization.name}`);

    res.status(200).json({
        success: true,
        data: organization
    });
});

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Super Admin
const deleteOrganization = asyncHandler(async (req, res) => {
    if (req.user.role?.roleName !== 'Super Admin') {
        res.status(403);
        throw new Error('Not authorized to delete organizations');
    }

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }

    // Delete all associated data
    await Lead.deleteMany({ organization: organization._id });
    await Contact.deleteMany({ organization: organization._id });
    await Activity.deleteMany({ organization: organization._id });
    await FollowUp.deleteMany({ organization: organization._id });
    await Referrer.deleteMany({ organization: organization._id });
    await Service.deleteMany({ organization: organization._id });
    await Billing.deleteMany({ organization: organization._id });
    await Expense.deleteMany({ organization: organization._id });
    await Role.deleteMany({ organization: organization._id, isSystemRole: false }); 
    await User.deleteMany({ organization: organization._id });
    
    await organization.deleteOne();

    logger.info(`Organization deleted: ${organization.name} (ID: ${organization._id}) and all associated data.`);
    await logAudit(req, 'DELETE', 'Organization', organization._id, `Deleted organization: ${organization.name} and ALL associated data`);

    res.status(200).json({
        success: true,
        data: {},
        message: 'Organization and all associated data deleted successfully'
    });
});

module.exports = {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization
};
