const mongoose = require('mongoose');
require('./Company'); // Register models to avoid Schema not registered errors
require('./User'); 
require('./Referrer');

const LeadSchema = new mongoose.Schema({
    // 1. Basic Lead Information
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        // unique: true, // Removed global uniqueness, using compound index with company
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
    companyName: {
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

    // 2. Lead Source Information
    source: {
        type: String,
        enum: ['Website', 'Referral', 'WhatsApp', 'Cold Call', 'Event', 'Other'],
        default: 'Other'
    },
    sourceDetails: {
        type: String // Referrer name, campaign, event name
    },
    campaignName: {
        type: String
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referrer'
    },

    // 3. Lead Status & Priority
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'],
        default: 'New'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    leadTemperature: {
        type: String,
        enum: ['Hot', 'Warm', 'Cold'],
        default: 'Cold'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lostReason: {
        type: String
    },

    // 4. Follow-Up Information
    nextFollowUpDate: {
        type: Date
    },
    followUpMode: {
        type: String,
        enum: ['Call', 'WhatsApp', 'Email', 'Meeting']
    },
    followUpRemarks: {
        type: String
    },
    followUpCount: {
        type: Number,
        default: 0
    },

    // 5. Business / Requirement Details
    requirement: {
        type: String
    },
    budgetRange: {
        type: String
    },
    expectedClosureDate: {
        type: Date
    },
    interestedProduct: {
        type: String
    },
    dealValue: {
        type: Number
    },

    // 6. Communication Preferences
    preferredContactMode: {
        type: String,
        enum: ['Call', 'WhatsApp', 'Email']
    },
    preferredContactTime: {
        type: String // e.g., "Morning", "Afternoon"
    },
    doNotDisturb: {
        type: Boolean,
        default: false
    },

    // 7. Tags & Custom Fields
    tags: {
        type: [String],
        default: []
    },
    customFields: {
        type: Map,
        of: String
    },

    // 8. Activity Tracking (Audit)
    lastContactedAt: {
        type: Date
    },
    convertedAt: {
        type: Date
    },
    isConverted: {
        type: Boolean,
        default: false
    },
    lostAt: {
        type: Date
    },
    createdBy: {
        type: String
    },

    // 9. Notes & Attachments
    notes: {
        type: String
    },
    internalComments: {
        type: String
    },
    attachments: {
        type: [String] // URLs or file paths
    },

    // Soft Delete Flag
    isDeleted: {
        type: Boolean,
        default: false
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Indexing for performance and multi-tenancy
LeadSchema.index({ company: 1, status: 1 });
LeadSchema.index({ company: 1, assignedTo: 1 });
LeadSchema.index({ company: 1, phone: 1 }, { unique: true }); // Ensure phone is unique PER COMPANY (Wait, typically leads are unique per company)



module.exports = mongoose.model('Lead', LeadSchema);
