const LeadCategory = require('../models/LeadCategory');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all lead categories
// @route   GET /api/lead-categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res) => {
    const query = { ...(req.organizationFilter || {}), isDeleted: false };
    
    const categories = await LeadCategory.find(query).sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});

// @desc    Create new lead category
// @route   POST /api/lead-categories
// @access  Private/Organization Admin
exports.createCategory = asyncHandler(async (req, res) => {
    const { name, color } = req.body;
    
    // Prioritize organization from body (set by tenantFilter) then from organizationFilter
    const organizationId = req.body.organization || 
                           req.organizationFilter?.organization || 
                           (req.user && (req.user.organization?._id || req.user.organization));
    
    if (!organizationId) {
        return res.status(400).json({ 
            success: false,
            message: 'Organization context is required. Please ensure an organization is selected.' 
        });
    }

    const category = await LeadCategory.create({
        name,
        color,
        organization: organizationId
    });

    await logAudit(req, 'CREATE', 'LeadCategory', category._id, `Created lead category: ${name}`);

    res.status(201).json({
        success: true,
        data: category
    });
});

// @desc    Update lead category
// @route   PUT /api/lead-categories/:id
// @access  Private/Organization Admin
exports.updateCategory = asyncHandler(async (req, res) => {
    let category = await LeadCategory.findOne({ 
        _id: req.params.id, 
        ...(req.organizationFilter || {}),
        isDeleted: false
    });

    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    category = await LeadCategory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    await logAudit(req, 'UPDATE', 'LeadCategory', category._id, `Updated lead category: ${category.name}`);

    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Delete lead category (soft delete)
// @route   DELETE /api/lead-categories/:id
// @access  Private/Organization Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await LeadCategory.findOne({ 
        _id: req.params.id, 
        ...(req.organizationFilter || {}),
        isDeleted: false
    });

    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    category.isDeleted = true;
    await category.save();

    await logAudit(req, 'DELETE', 'LeadCategory', category._id, `Deleted lead category: ${category.name}`);

    res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
    });
});
