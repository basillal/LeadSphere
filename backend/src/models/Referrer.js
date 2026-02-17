const mongoose = require('mongoose');

const ReferrerSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Please add a referrer name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    alternatePhone: {
        type: String,
        trim: true
    },
    organizationName: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    
    // Additional Information
    notes: {
        type: String,
        trim: true
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Multi-tenancy & Ownership
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Referrer must belong to an organization']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Soft Delete Flag
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

// Index for better query performance
ReferrerSchema.index({ name: 1 });
ReferrerSchema.index({ phone: 1 });
ReferrerSchema.index({ organization: 1 });
ReferrerSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Referrer', ReferrerSchema);
