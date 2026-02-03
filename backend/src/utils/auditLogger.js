const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

/**
 * Log an audit event
 * @param {Object} req - Express request object (to extract user, ip, company)
 * @param {String} action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {String} entity - Entity modified (Lead, Contact, User, etc.)
 * @param {String|Object} entityId - ID of the entity
 * @param {String} details - Readable description
 * @param {Object} metadata - Additional data (optional)
 */
const logAudit = async (req, action, entity, entityId, details, metadata = {}) => {
    try {
        if (!req.user) {
            // System action or unauthenticated (login attempt?)
            return; 
        }

        const auditEntry = {
            user: req.user._id,
            company: req.user.company?._id || req.user.company, // Handle populated or unpopulated
            action,
            entity,
            entityId,
            details,
            metadata,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };

        const createdLog = await AuditLog.create(auditEntry);
    } catch (error) {
        // Don't crash the app if logging fails, but log the error
        logger.error(`Audit Log Failed: ${error.message}`);
    }
};

module.exports = { logAudit };
