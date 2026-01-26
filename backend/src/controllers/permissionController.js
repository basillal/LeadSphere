const asyncHandler = require('express-async-handler');
const Permission = require('../models/Permission');

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private (Admin)
const getPermissions = asyncHandler(async (req, res) => {
    const permissions = await Permission.find({}).sort({ resource: 1, permissionName: 1 });
    res.json(permissions);
});

// @desc    Get permissions grouped by resource
// @route   GET /api/permissions/grouped
// @access  Private (Admin)
const getGroupedPermissions = asyncHandler(async (req, res) => {
    const permissions = await Permission.find({}).sort({ resource: 1, permissionName: 1 });
    
    const grouped = permissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) {
            acc[perm.resource] = [];
        }
        acc[perm.resource].push(perm);
        return acc;
    }, {});

    res.json(grouped);
});

module.exports = {
    getPermissions,
    getGroupedPermissions
};
