const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin/Super Admin)
const getAuditLogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};
    const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
    const organizationId = req.user.organization?._id || req.user.organization;

    // Filter by Organization
    if (!isSuperAdmin) {
        if (!organizationId) {
            res.status(403);
            throw new Error('Not authorized');
        }
        query.organization = organizationId;
    } else {
        // Super Admin can filter by organization
        if (req.query.organizationId) {
            query.organization = req.query.organizationId;
        }
    }
    
    // Filter by Entity (e.g., 'Role', 'User')
    if (req.query.entity) {
        query.entity = new RegExp(req.query.entity, 'i');
    }

    // Filter by Action
    if (req.query.action) {
        query.action = new RegExp(req.query.action, 'i');
    }

    // Filter by User
    if (req.query.userId) {
        query.user = req.query.userId;
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
        .populate('user', 'name email')
        .populate('organization', 'name') // Helpful for Super Admin
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: logs.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        },
        data: logs
    });
});

module.exports = {
    getAuditLogs
};
