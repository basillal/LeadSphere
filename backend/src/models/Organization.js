const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an organization name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['Free', 'Basic', 'Pro', 'Enterprise'],
        default: 'Free'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        currency: { type: String, default: 'USD' },
        timezone: { type: String, default: 'UTC' },
        logo: { type: String }
    },
    // Contact Info for Invoices/Display
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Organization', OrganizationSchema);
