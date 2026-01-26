const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a company name'],
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
