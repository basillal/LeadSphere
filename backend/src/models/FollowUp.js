const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Please add a schedule date and time']
    },
    type: {
        type: String,
        enum: ['Call', 'Email', 'Meeting', 'WhatsApp', 'Task'],
        default: 'Call'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Missed', 'Rescheduled'],
        default: 'Pending'
    },
    notes: {
        type: String,
        trim: true
    },
    outcome: {
        type: String,
        trim: true
    },
    assignedTo: {
        type: String // In future could be ObjectId ref 'User'
    },
    createdBy: {
        type: String // In future could be ObjectId ref 'User'
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Index for efficient queries
FollowUpSchema.index({ scheduledAt: 1, status: 1 });
FollowUpSchema.index({ lead: 1 });

module.exports = mongoose.model('FollowUp', FollowUpSchema);
