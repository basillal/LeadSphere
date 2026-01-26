const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Role = require('../models/Role');
const { successResponse } = require('../utils/responseHandler'); // Assuming this exists, based on previous file content

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().populate('role').select('-password');
    // successResponse(res, 'Users retrieved successfully', users); 
    // Keeping consistency with other controllers which return JSON directly often, 
    // but preserving existing pattern if preferred. 
    // Let's stick to standard JSON for now for easier frontend consumption unless successResponse is standard.
    // The previous file used successResponse, so I'll try to stick to it OR just return JSON.
    // To be safe and consistent with authController, I will return JSON.
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
    const { name, email, password, roleId, isActive } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password is handled in Model pre-save
    const user = await User.create({
        name,
        email,
        password,
        role: roleId,
        isActive: isActive !== undefined ? isActive : true
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
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
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.roleId) {
            user.role = req.body.roleId;
        }
        if (req.body.isActive !== undefined) {
             user.isActive = req.body.isActive;
        }
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        
        // Return without password
        const userResponse = await User.findById(updatedUser._id).populate('role').select('-password');
        res.json(userResponse);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent deleting Super Admin
        // Check if role is Super Admin
        const role = await Role.findById(user.role);
        if (role && role.isSystemRole && role.roleName === 'Super Admin') {
            res.status(400);
            throw new Error('Cannot delete Super Admin user');
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Reset user password to email
// @route   POST /api/users/:id/reset-password
// @access  Private (Admin)
const resetPassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent resetting Super Admin if not self? (Optional, but safe)
        // Set password to email
        user.password = user.email; // Will be hashed by pre-save hook
        await user.save();
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