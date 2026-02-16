const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Role = require('../models/Role');
const { logAudit } = require('../utils/auditLogger');
const { successResponse } = require('../utils/responseHandler'); // Assuming this exists, based on previous file content

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
    // 1. Determine Scope
    const query = {};
    
    // If tenant middleware is logically used or we manual check:
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const organizationId = req.user.organization?._id;

    if (!isSuperAdmin) {
        if (!organizationId) {
             res.status(403);
             throw new Error('Not authorized'); // Should interact with middleware, but safe fallback
        }
        query.organization = organizationId;
    } else {
        // Super Admin can filter by organization if provided
        if (req.query.organization) {
            query.organization = req.query.organization;
        }
    }

    const users = await User.find(query)
        .populate('role')
        .populate('organization', 'name') // Helpful to see organization name
        .select('-password');
    res.json(users);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate('role').select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
const createUser = asyncHandler(async (req, res) => {
    // ... params extraction code ...
    const { name, email, password, roleId, isActive, organization: organizationInput } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Determine Organization
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    let targetOrganization = isSuperAdmin ? organizationInput : req.user.organization?._id;

    if (!isSuperAdmin && !targetOrganization) {
         res.status(400);
         throw new Error('Organization context missing for new user.');
    }

    // Role Security Check
    if (roleId) {
        const targetRole = await Role.findById(roleId);
        if (targetRole && targetRole.roleName === 'Super Admin' && !isSuperAdmin) {
             res.status(403);
             throw new Error('Not authorized to assign Super Admin role');
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        role: roleId,
        organization: targetOrganization,
        isActive: isActive !== undefined ? isActive : true
    });

    if (user) {
        await logAudit(req, 'CREATE', 'User', user._id, `Created user: ${user.email} (${user.name})`);
        
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization,
            isActive: user.isActive
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = asyncHandler(async (req, res) => {
    // ... (fetch and access check logic remains same) ...
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    
    if (!isSuperAdmin) {
        if (user.organization?.toString() !== req.user.organization?._id.toString()) {
             res.status(404);
             throw new Error('User not found');
        }
    }

    // Store old values for audit details?
    const previousEmail = user.email;

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.roleId) {
        const targetRole = await Role.findById(req.body.roleId);
        if (targetRole && targetRole.roleName === 'Super Admin' && !isSuperAdmin) {
             res.status(403);
             throw new Error('Not authorized to assign Super Admin role');
        }
        user.role = req.body.roleId;
    }
    
    if (req.body.isActive !== undefined) {
            user.isActive = req.body.isActive;
    }
    if (req.body.password) {
        user.password = req.body.password;
    }

    const updatedUser = await user.save();
    
    await logAudit(req, 'UPDATE', 'User', updatedUser._id, `Updated user: ${updatedUser.email}`);
    
    const userResponse = await User.findById(updatedUser._id).populate('role').populate('organization').select('-password');
    res.json(userResponse);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    if (!isSuperAdmin) {
        if (user.organization?.toString() !== req.user.organization?._id.toString()) {
             res.status(404);
             throw new Error('User not found');
        }
    }

    const role = await Role.findById(user.role);
    if (role && role.isSystemRole && role.roleName === 'Super Admin') {
        res.status(400);
        throw new Error('Cannot delete Super Admin user');
    }

    await user.deleteOne();
    
    await logAudit(req, 'DELETE', 'User', user._id, `Deleted user: ${user.email} (${user.name})`);
    
    res.json({ message: 'User removed' });
});

// @desc    Reset user password to email
// @route   POST /api/users/:id/reset-password
// @access  Private (Admin)
const resetPassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.password = user.email;
        await user.save();
        
        await logAudit(req, 'UPDATE', 'User', user._id, `Reset password for user: ${user.email}`);
        
        res.json({ message: `Password reset to ${user.email}` });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword
};