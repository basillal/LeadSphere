const asyncHandler = require('express-async-handler');
const Role = require('../models/Role');
const User = require('../models/User');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin)
const getRoles = asyncHandler(async (req, res) => {
    const roles = await Role.find({}).populate('permissions');
    res.json(roles);
});

// @desc    Get single role
// @route   GET /api/roles/:id
// @access  Private (Admin)
const getRole = asyncHandler(async (req, res) => {
    const role = await Role.findById(req.params.id).populate('permissions');
    if (role) {
        res.json(role);
    } else {
        res.status(404);
        throw new Error('Role not found');
    }
});

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin)
const createRole = asyncHandler(async (req, res) => {
    const { roleName, description, permissions } = req.body;

    const roleExists = await Role.findOne({ roleName });
    if (roleExists) {
        res.status(400);
        throw new Error('Role already exists');
    }

    const role = await Role.create({
        roleName,
        description,
        permissions
    });

    if (role) {
        res.status(201).json(role);
    } else {
        res.status(400);
        throw new Error('Invalid role data');
    }
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin)
const updateRole = asyncHandler(async (req, res) => {
    const role = await Role.findById(req.params.id);

    if (role) {
        if (role.isSystemRole) {
             // System roles (like Super Admin) might be restricted from name change or deletion, but maybe allow permission update?
             // For safety, let's block name change for system roles, but allow permission/description
             if(req.body.roleName && req.body.roleName !== role.roleName) {
                 res.status(400);
                 throw new Error('Cannot rename system role');
             }
        }

        role.roleName = req.body.roleName || role.roleName;
        role.description = req.body.description || role.description;
        role.permissions = req.body.permissions || role.permissions;

        const updatedRole = await role.save();
        res.json(updatedRole);
    } else {
        res.status(404);
        throw new Error('Role not found');
    }
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
const deleteRole = asyncHandler(async (req, res) => {
    const role = await Role.findById(req.params.id);

    if (role) {
        if (role.isSystemRole) {
            res.status(400);
            throw new Error('Cannot delete system role');
        }

        // Check if any user is using this role
        const userExists = await User.findOne({ role: role._id });
        if (userExists) {
            res.status(400);
            throw new Error('Cannot delete role assigned to users');
        }

        await role.deleteOne();
        res.json({ message: 'Role removed' });
    } else {
        res.status(404);
        throw new Error('Role not found');
    }
});

module.exports = {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole
};
