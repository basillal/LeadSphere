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
        
        if (userPermissions.includes(requiredPermission)) {
            next();
        } else {
            res.status(403);
            throw new Error(`Not authorized. Required permission: ${requiredPermission}`);
        }
    });
};

module.exports = { checkPermission };
