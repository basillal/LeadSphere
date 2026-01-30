const Billing = require('../models/Billing');
const Contact = require('../models/Contact');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');

// @desc    Get all billings
// @route   GET /api/billings
// @access  Private
const getBillings = asyncHandler(async (req, res) => {
    const query = { ...(req.companyFilter || {}), isDeleted: false };
    
    if (req.query.contactId) {
        query.contact = req.query.contactId;
    }
    if (req.query.paymentStatus) {
        query.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
            { invoiceNumber: searchRegex },
            { notes: searchRegex }
        ];
    }
    
    // Date Range
    if (req.query.startDate && req.query.endDate) {
        query.billingDate = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    const billings = await Billing.find(query)
        .populate('contact', 'name email phone companyName')
        .populate('services.serviceId', 'serviceName serviceCode')
        .populate('createdBy', 'name')
        .sort({ billingDate: -1 });

    res.status(200).json({
        success: true,
        count: billings.length,
        data: billings
    });
});

// @desc    Get single billing
// @route   GET /api/billings/:id
// @access  Private
const getBilling = asyncHandler(async (req, res) => {
    const billing = await Billing.findById(req.params.id)
        .populate('contact', 'name email phone companyName address')
        .populate('services.serviceId', 'serviceName serviceCode description')
        .populate('company')
        .populate('createdBy', 'name');

    if (!billing || billing.isDeleted) {
        res.status(404);
        throw new Error('Billing record not found');
    }

    // Permission Check
    if (req.user.role?.roleName !== 'Super Admin') {
         if (!req.user.company || (billing.company && billing.company.toString() !== req.user.company._id.toString())) {
             res.status(404);
             throw new Error('Billing record not found');
         }
    }

    res.status(200).json({
        success: true,
        data: billing
    });
});

// @desc    Create new billing
// @route   POST /api/billings
// @access  Private
const createBilling = asyncHandler(async (req, res) => {
    const { contactId, services, paymentStatus, paymentMode, billingDate, dueDate, notes, discount } = req.body;

    if (!contactId || !services || services.length === 0) {
        res.status(400);
        throw new Error('Contact and at least one service are required');
    }

    const companyId = req.user.company?._id || req.user.company;

    // Verify contact belongs to company
    const contact = await Contact.findById(contactId);
    if (!contact || contact.company.toString() !== companyId.toString()) {
         res.status(400);
         throw new Error('Invalid contact');
    }

    // Generate Invoice Number (Simple sequential or random for now)
    // PROD: Use a counter collection to ensure sequential numbers (INV-001, INV-002)
    const count = await Billing.countDocuments({ company: companyId });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // Calculate totals (Backend validation)
    let subtotal = 0;
    let taxTotal = 0;

    const processedServices = services.map(s => {
        const itemTotal = s.quantity * s.unitAmount;
        const itemTax = s.taxAmount || 0;
        subtotal += itemTotal;
        taxTotal += itemTax; // Assuming taxAmount passed is total tax for the line item. 
        // If tax is %: itemTax = itemTotal * (taxPercent / 100).
        // For now trusting frontend payload but ideally should recalculate based on Service ID lookups.
        return {
            ...s,
            totalAmount: itemTotal + itemTax
        };
    });

    const grandTotal = subtotal + taxTotal - (discount || 0);

    const billing = await Billing.create({
        contact: contactId,
        company: companyId,
        invoiceNumber,
        services: processedServices,
        subtotal,
        taxTotal,
        discount: discount || 0,
        grandTotal,
        paymentStatus,
        paymentMode,
        billingDate: billingDate || new Date(),
        dueDate,
        notes,
        createdBy: req.user._id
    });

    logger.info(`Invoice created: ${invoiceNumber} for Contact ${contact.name}`);

    res.status(201).json({
        success: true,
        data: billing
    });
});

// @desc    Update billing
// @route   PUT /api/billings/:id
// @access  Private
const updateBilling = asyncHandler(async (req, res) => {
    let billing = await Billing.findById(req.params.id);

    if (!billing || billing.isDeleted) {
        res.status(404);
        throw new Error('Billing record not found');
    }

    // Permission check
    if (req.user.role?.roleName !== 'Super Admin') {
        if (!req.user.company || (billing.company && billing.company.toString() !== req.user.company._id.toString())) {
            res.status(404);
            throw new Error('Billing record not found');
        }
    }

    billing = await Billing.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    .populate('contact', 'name')
    .populate('services.serviceId', 'serviceName');

    res.status(200).json({
        success: true,
        data: billing
    });
});

// @desc    Delete billing (Soft)
// @route   DELETE /api/billings/:id
// @access  Private
const deleteBilling = asyncHandler(async (req, res) => {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
        res.status(404);
        throw new Error('Billing record not found');
    }

    // Permission check
    if (req.user.role?.roleName !== 'Super Admin') {
        if (!req.user.company || (billing.company && billing.company.toString() !== req.user.company._id.toString())) {
            res.status(404);
            throw new Error('Billing record not found');
        }
    }

    billing.isDeleted = true;
    await billing.save();

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    getBillings,
    getBilling,
    createBilling,
    updateBilling,
    deleteBilling
};
