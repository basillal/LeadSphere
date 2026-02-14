const asyncHandler = require('express-async-handler');

// Check if user has specific permission
// usage: checkPermission('LEAD_READ')
const checkPermission = (requiredPermission) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(403);
            throw new Error('Not authorized, no role assigned');
        }

        // Super Admin Bypass
        if (req.user.role.isSystemRole && req.user.role.roleName === 'Super Admin') {
            return next();
        }

        const userPermissions = req.user.role.permissions.map(p => p.permissionName);
        
        // Handle array of required permissions (OR logic)
        let hasPermission = false;
        if (Array.isArray(requiredPermission)) {
            hasPermission = requiredPermission.some(perm => userPermissions.includes(perm));
        } else {
            hasPermission = userPermissions.includes(requiredPermission);
        }

        if (hasPermission) {
            next();
        } else {
            res.status(403);
            throw new Error(`Not authorized. Required permission: ${requiredPermission}`);
        }
    });
};

module.exports = { checkPermission };
