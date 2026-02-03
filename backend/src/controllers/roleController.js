const asyncHandler = require('express-async-handler');
const Role = require('../models/Role');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin)
const getRoles = asyncHandler(async (req, res) => {
    const query = {};
    
    // Super Admin sees all? Or scoping?
    // Usually Super Admin wants to see Global System Roles + their own company roles?
    // Let's standardise:
    // 1. Fetch System Roles (Global) - accessible to everyone usually, or just admins?
    // 2. Fetch Company Scope Roles
    
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const companyId = req.user.company?._id || req.user.company;

    if (isSuperAdmin) {
        // If query param company is provided, filter by that.
        // Else, show Global System Roles + Roles of specific company context if any
        if (req.query.company) {
            query.company = req.query.company;
        } else {
            // Show all roles? Might be too many. 
            // Default: Show System Roles + Own Company Roles ?? 
            // Or just return everything for Super Admin management?
            // Let's return everything for now if no filter.
        }
    } else {
        // Regular Company Admin/User
        // Show Global System Roles AND Company Roles
        query.$or = [
            { scope: 'global' }, 
            { company: companyId }
        ];
    }
    
    // Safety: Hide Super Admin role from non-super admins?
    // The previous code did this.
    if (!isSuperAdmin) {
        // We can filter this in memory or query
        // But note: "Super Admin" role is likely scope='global'
    }

    const roles = await Role.find(query).populate('permissions');
    
    // Filter out "Super Admin" from result if not super admin
    const safeRoles = roles.filter(r => {
        if (!isSuperAdmin && r.roleName === 'Super Admin') return false;
        return true;
    });

    res.json(safeRoles);
});

// @desc    Get single role
// @route   GET /api/roles/:id
// @access  Private (Admin)
const getRole = asyncHandler(async (req, res) => {
    const role = await Role.findById(req.params.id).populate('permissions');
    
    if (!role) {
        res.status(404);
        throw new Error('Role not found');
    }

    // Access Check
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const companyId = req.user.company?._id || req.user.company;

    if (!isSuperAdmin) {
        // Can view if Global OR Belongs to Company
        if (role.scope !== 'global' && (!role.company || role.company.toString() !== companyId.toString())) {
             res.status(403);
             throw new Error('Not authorized to view this role');
        }
    }

    res.json(role);
});

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin)
const createRole = asyncHandler(async (req, res) => {
    const { roleName, description, permissions } = req.body;
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const companyId = req.user.company?._id || req.user.company;

    // Determine Scope & Company
    let roleScope = 'company';
    let roleCompany = companyId;

    if (isSuperAdmin) {
        // Super Admin can create Global roles
        if (req.body.isSystemRole) { // Or some flag
             roleScope = 'global';
             roleCompany = null;
        } else if (req.body.company) {
             roleCompany = req.body.company;
        }
    } else {
        if (!companyId) {
             res.status(400);
             throw new Error('Company context missing');
        }
    }

    // Check for duplicate in this scope
    const query = { roleName };
    if (roleCompany) {
        query.company = roleCompany;
    } else {
        // Global role check
        query.scope = 'global'; // or company: null
    }

    const roleExists = await Role.findOne(query);
    if (roleExists) {
        res.status(400);
        throw new Error('Role with this name already exists in this company/scope');
    }

    const role = await Role.create({
        roleName,
        description,
        permissions,
        company: roleCompany,
        scope: roleScope,
        isSystemRole: false
    });

    if (role) {
        await logAudit(req, 'CREATE', 'Role', role._id, `Created role: ${roleName}`);
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

    if (!role) {
        res.status(404);
        throw new Error('Role not found');
    }

    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const companyId = req.user.company?._id || req.user.company;

    // Authorization
    if (!isSuperAdmin) {
        if (role.isSystemRole || role.scope === 'global') {
            res.status(403);
            throw new Error('Cannot edit system/global roles');
        }
        if (role.company && role.company.toString() !== companyId.toString()) {
            res.status(403);
            throw new Error('Not authorized to edit this role');
        }
    }

    // Name Duplicate Check (if changing name)
    if (req.body.roleName && req.body.roleName !== role.roleName) {
         // Check if new name exists in same scope
         const query = { roleName: req.body.roleName };
         if (role.company) query.company = role.company;
         else query.scope = 'global';
         
         const duplicate = await Role.findOne(query);
         if (duplicate) {
             res.status(400);
             throw new Error('Role name already exists');
         }
    }

    role.roleName = req.body.roleName || role.roleName;
    role.description = req.body.description || role.description;
    role.permissions = req.body.permissions || role.permissions;

    const updatedRole = await role.save();
    
    await logAudit(req, 'UPDATE', 'Role', role._id, `Updated role: ${role.roleName}`);
    
    res.json(updatedRole);
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
const deleteRole = asyncHandler(async (req, res) => {
    const role = await Role.findById(req.params.id);

    if (!role) {
        res.status(404);
        throw new Error('Role not found');
    }

    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const companyId = req.user.company?._id || req.user.company;

    // Authorization
    if (!isSuperAdmin) {
        if (role.isSystemRole || role.scope === 'global') {
            res.status(403);
            throw new Error('Cannot delete system/global roles');
        }
        if (role.company && role.company.toString() !== companyId.toString()) {
            res.status(403);
            throw new Error('Not authorized to delete this role');
        }
    }

    if (role.isSystemRole) {
         // Super Admin might delete system role if really needed, but generally blocked
         if (!isSuperAdmin) {
            res.status(400);
            throw new Error('Cannot delete system role');
         }
    }

    // Check if any user is using this role
    const userExists = await User.findOne({ role: role._id });
    if (userExists) {
        res.status(400);
        throw new Error('Cannot delete role assigned to users');
    }

    await role.deleteOne();
    
    await logAudit(req, 'DELETE', 'Role', role._id, `Deleted role: ${role.roleName}`);
    
    res.json({ message: 'Role removed' });
});

module.exports = {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole
};
