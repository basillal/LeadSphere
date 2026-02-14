const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
    billingId: {
        type: String,
        unique: true
    },
    contact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    services: [{
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        serviceName: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitAmount: {
            type: Number,
            required: true,
            min: 0
        },
        taxAmount: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    taxTotal: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE'],
        default: 'PENDING'
    },
    paymentMode: {
        type: String,
        enum: ['CASH', 'UPI', 'CARD', 'BANK', 'CHEQUE', 'OTHER'],
        default: 'BANK'
    },
    billingDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
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

// Auto-generate billingId and invoiceNumber
BillingSchema.pre('save', async function() {
    if (!this.billingId) {
        this.billingId = `BILL-${Date.now()}`;
    }
    // Note: Invoice Number usually needs sequential logic (e.g., INV-001, INV-002)
    // For now, we'll use a precise timestamp or rely on the Controller to provide a sequential one.
    // Let's assume controller provides it or we default to random/timestamp if missing.
    if (!this.invoiceNumber) {
        this.invoiceNumber = `INV-${Date.now()}`;
    }
});

BillingSchema.index({ company: 1, invoiceNumber: 1 }, { unique: true });
BillingSchema.index({ contact: 1 });
BillingSchema.index({ paymentStatus: 1 });
BillingSchema.index({ billingDate: 1 });

module.exports = mongoose.model('Billing', BillingSchema);
