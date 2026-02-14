const Company = require('../models/Company');
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

// @desc    Get all companies
// @route   GET /api/companies
// @access  Super Admin
const getCompanies = asyncHandler(async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
        query.name = new RegExp(req.query.search, 'i');
    }

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: companies.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        },
        data: companies
    });
});

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Super Admin (or Company Admin for their own)
const getCompany = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id).populate('owner', 'name email');

    if (!company) {
        res.status(404);
        throw new Error('Company not found');
    }

    // Access Check: Super Admin OR Owner
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isOwner = req.user.company?._id.toString() === company._id.toString();

    if (!isSuperAdmin && !isOwner) {
        res.status(403);
        throw new Error('Not authorized to view this company');
    }

    res.status(200).json({
        success: true,
        data: company
    });
});

// @desc    Create new company
// @route   POST /api/companies
// @access  Super Admin
const createCompany = asyncHandler(async (req, res) => {
    const { 
        name, ownerEmail, ownerName, plan, settings,
        description, phone, email, website, address, logo 
    } = req.body;

    if (!name || !ownerEmail) {
        res.status(400);
        throw new Error('Company name and Owner email are required');
    }

    // 1. Check if owner user exists
    let owner = await User.findOne({ email: ownerEmail });
    
    // Prepare settings object (merge provided settings with logo if present)
    const companySettings = { ...settings };
    if (logo) companySettings.logo = logo;

    // 2. Create Company
    const company = await Company.create({
        name,
        plan: plan || 'Free',
        settings: companySettings,
        description,
        phone,
        email, 
        website,
        address,
        owner: owner ? owner._id : new mongoose.Types.ObjectId() // Placeholder if creating new user
    });

    // 3. If User doesn't exist, create them (with a default password to be changed)
    let isNewUser = false;
    const companyAdminRole = await require('../models/Role').findOne({ roleName: 'Company Admin' });

    if (!owner) {
        isNewUser = true;
        owner = await User.create({
            name: ownerName || 'Admin',
            email: ownerEmail,
            password: 'Password123!', // Temporary password
            company: company._id,
            role: companyAdminRole ? companyAdminRole._id : null
        });
        
        // Update company with real owner ID
        company.owner = owner._id;
        await company.save();
    } else {
        if (owner.company) {
             // Rollback
             await company.deleteOne();
             res.status(400);
             throw new Error('User already belongs to a company');
        }
        owner.company = company._id;
        if (companyAdminRole) {
            owner.role = companyAdminRole._id; 
        }
        await owner.save();
    }

    logger.info(`New company created: ${company.name} by ${req.user.name}`);
    await logAudit(req, 'CREATE', 'Company', company._id, `Created company: ${company.name}`);

    res.status(201).json({
        success: true,
        data: company,
        owner: {
            id: owner._id,
            email: owner.email,
            isNewUser,
            tempPassword: isNewUser ? 'Password123!' : undefined
        }
    });
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Super Admin or Company Owner
const updateCompany = asyncHandler(async (req, res) => {
    let company = await Company.findById(req.params.id);

    if (!company) {
        res.status(404);
        throw new Error('Company not found');
    }

    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const isOwner = req.user.company?._id.toString() === company._id.toString();

    if (!isSuperAdmin && !isOwner) {
        res.status(403);
        throw new Error('Not authorized');
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    await logAudit(req, 'UPDATE', 'Company', company._id, `Updated company settings: ${company.name}`);

    res.status(200).json({
        success: true,
        data: company
    });
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Super Admin
const deleteCompany = asyncHandler(async (req, res) => {
    if (req.user.role?.roleName !== 'Super Admin') {
        res.status(403);
        throw new Error('Not authorized to delete companies');
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
        res.status(404);
        throw new Error('Company not found');
    }

    // Delete all associated data
    await Lead.deleteMany({ company: company._id });
    await Contact.deleteMany({ company: company._id });
    await Activity.deleteMany({ company: company._id });
    await FollowUp.deleteMany({ company: company._id });
    await Referrer.deleteMany({ company: company._id });
    await Service.deleteMany({ company: company._id });
    await Billing.deleteMany({ company: company._id });
    await Expense.deleteMany({ company: company._id });
    await Role.deleteMany({ company: company._id, isSystemRole: false }); 
    await User.deleteMany({ company: company._id });
    
    await company.deleteOne();

    logger.info(`Company deleted: ${company.name} (ID: ${company._id}) and all associated data.`);
    await logAudit(req, 'DELETE', 'Company', company._id, `Deleted company: ${company.name} and ALL associated data`);

    res.status(200).json({
        success: true,
        data: {},
        message: 'Company and all associated data deleted successfully'
    });
});

module.exports = {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany
};
