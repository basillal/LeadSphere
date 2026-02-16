const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    action: {
        type: String,
        required: true // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    },
    entity: {
        type: String,
        required: true // e.g., 'Lead', 'Invoice', 'User'
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        // formatted as string or ObjectId depending on needs
    },
    details: {
        type: String // Human readable description
    },
    metadata: {
        type: Object // JSON dump of changes or relevant data
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
