const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    // Reference to Contact or Lead
    relatedTo: {
        type: String,
        enum: ['Contact', 'Lead'],
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedTo',
        required: true
    },
    relatedName: {
        type: String,
        required: true
    },

    // Activity Type
    activityType: {
        type: String,
        enum: ['Call', 'Meeting', 'Email', 'WhatsApp', 'Note', 'Task', 'Other'],
        required: true
    },

    // Call Log Specific Fields
    callDetails: {
        duration: String, // e.g., "15 minutes"
        callType: {
            type: String,
            enum: ['Incoming', 'Outgoing', 'Missed']
        },
        callStatus: {
            type: String,
            enum: ['Completed', 'No Answer', 'Busy', 'Failed']
        }
    },

    // Meeting Specific Fields
    meetingDetails: {
        location: String,
        meetingType: {
            type: String,
            enum: ['In-Person', 'Video Call', 'Phone Call']
        },
        attendees: [String],
        agenda: String
    },

    // Common Fields
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },

    // Date and Time
    activityDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    startTime: {
        type: String // e.g., "10:00 AM"
    },
    endTime: {
        type: String // e.g., "11:00 AM"
    },

    // Status and Priority
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Pending'],
        default: 'Completed'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },

    // Outcome and Follow-up
    outcome: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative', 'Follow-up Required', 'None'],
        default: 'None'
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    followUpNotes: {
        type: String
    },

    // Attachments
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Tags and Categories
    tags: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        enum: ['Sales', 'Support', 'Follow-up', 'General', 'Other'],
        default: 'General'
    },

    // User tracking
    createdBy: {
        type: String,
        required: true
    },
    lastModifiedBy: {
        type: String
    },

    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    
    // Multi-tenancy
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { 
    timestamps: true 
});

// Indexes for faster queries
ActivitySchema.index({ relatedTo: 1, relatedId: 1 });
ActivitySchema.index({ activityType: 1 });
ActivitySchema.index({ activityDate: -1 });
ActivitySchema.index({ status: 1 });
ActivitySchema.index({ isDeleted: 1 });
ActivitySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);
