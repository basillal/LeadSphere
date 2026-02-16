const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    // Reference to original lead (if converted)
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    convertedFrom: {
        type: String,
        enum: ['Lead', 'Manual', 'Import'],
        default: 'Manual'
    },

    // 1. Basic Contact Information
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        trim: true
    },
    alternatePhone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    organizationName: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },

    // 2. Relationship & Tags
    tags: {
        type: [String],
        enum: ['Client', 'Vendor', 'Friend', 'Partner', 'Other'],
        default: []
    },
    relationshipType: {
        type: String,
        enum: ['Business', 'Personal', 'Professional', 'Mixed'],
        default: 'Business'
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referrer'
    },

    // 3. Social & Additional Contact Info
    linkedInProfile: {
        type: String,
        trim: true
    },
    twitterHandle: {
        type: String,
        trim: true
    },
    facebookProfile: {
        type: String,
        trim: true
    },
    birthday: {
        type: Date
    },
    anniversary: {
        type: Date
    },

    // 4. Address Information
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },

    // 5. Business Information
    industry: {
        type: String,
        trim: true
    },
    organizationSize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+', 'Unknown'],
        default: 'Unknown'
    },
    annualRevenue: {
        type: String
    },

    // 6. Interaction Tracking
    lastInteractionDate: {
        type: Date
    },
    lastInteractionType: {
        type: String
    },
    interactionCount: {
        type: Number,
        default: 0
    },
    nextFollowUpDate: {
        type: Date
    },

    // 7. Communication Preferences
    preferredContactMode: {
        type: String,
        enum: ['Call', 'WhatsApp', 'Email', 'Meeting'],
        default: 'Call'
    },
    preferredContactTime: {
        type: String // e.g., "Morning", "Afternoon", "Evening"
    },
    doNotDisturb: {
        type: Boolean,
        default: false
    },
    timezone: {
        type: String
    },

    // 8. Notes & Custom Fields
    notes: {
        type: String
    },
    internalComments: {
        type: String
    },
    customFields: {
        type: Map,
        of: String
    },

    // 9. Status & Activity
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Archived'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedBy: {
        type: String
    },

    // 10. Attachments
    attachments: {
        type: [String] // URLs or file paths
    },

    // Soft Delete Flag
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for faster queries
ContactSchema.index({ organization: 1, phone: 1 }, { unique: true });
ContactSchema.index({ name: 1, phone: 1 });
ContactSchema.index({ tags: 1 });
ContactSchema.index({ organizationName: 1 });
ContactSchema.index({ isDeleted: 1, isActive: 1 });

module.exports = mongoose.model('Contact', ContactSchema);
