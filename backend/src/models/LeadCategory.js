const mongoose = require('mongoose');

const LeadCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true
    },
    color: {
        type: String,
        default: '#3b82f6' // Tailwind Blue 500
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure unique name PER ORGANIZATION
LeadCategorySchema.index({ name: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('LeadCategory', LeadCategorySchema);
