const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        unique: true
    },
    serviceName: {
        type: String,
        required: [true, 'Please add a service name'],
        trim: true
    },
    serviceCode: {
        type: String,
        required: [true, 'Please add a service code'],
        trim: true,
        uppercase: true
    },
    industryType: {
        type: String,
        enum: ['Education', 'IT', 'Finance', 'Healthcare', 'Real Estate', 'Other'],
        required: true
    },
    baseAmount: {
        type: Number,
        required: true,
        min: 0
    },
    taxPercentage: {
        type: Number,
        default: 0,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    customFields: {
        type: Map,
        of: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Middleware to auto-generate serviceId
ServiceSchema.pre('save', async function() {
    if (!this.serviceId) {
        // Simple ID generation strategy: SER-<Timestamp>
        this.serviceId = `SER-${Date.now()}`;
    }
});

// Compound unique index for serviceName within a company
ServiceSchema.index({ company: 1, serviceName: 1 }, { unique: true });
ServiceSchema.index({ company: 1, serviceCode: 1 }, { unique: true });

module.exports = mongoose.model('Service', ServiceSchema);
