const Billing = require('../models/Billing');
const Contact = require('../models/Contact');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');
const Counter = require('../models/Counter');

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
         const userCompanyId = req.user.company?._id || req.user.company;
         const billingCompanyId = billing.company?._id || billing.company;
         
         if (!userCompanyId || (billingCompanyId && billingCompanyId.toString() !== userCompanyId.toString())) {
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
    // Format: INV-<GlobalSeq>_<Year>_<CompanyInitials>-<CompanySeq>
    
    // 1. Global Sequence
    const globalCounter = await Counter.findByIdAndUpdate(
        'invoice_global',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    const globalSeq = globalCounter.seq;

    // 2. Year
    const year = new Date().getFullYear();

    // 3. Company Initials
    const companyName = req.user.company?.name || 'Company';
    const initials = companyName
        .match(/\b\w/g) // Get first letter of each word
        .join('')
        .toUpperCase();

    // 4. Company Sequence
    const companyCounter = await Counter.findByIdAndUpdate(
        `invoice_company_${companyId}`,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    const companySeq = companyCounter.seq.toString().padStart(3, '0');

    const invoiceNumber = `INV-${globalSeq}-${year}-${initials}-${companySeq}`;

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
    await logAudit(req, 'CREATE', 'Billing', billing._id, `Created invoice: ${invoiceNumber} (${req.user.company?.currency || '$'}${grandTotal})`);

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

    // Capture old status
    const oldStatus = billing.paymentStatus;

    billing = await Billing.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    .populate('contact', 'name')
    .populate('services.serviceId', 'serviceName');
    
    // Log meaningful changes
    const detailMsg = oldStatus !== billing.paymentStatus 
        ? `Updated invoice ${billing.invoiceNumber} status: ${oldStatus} -> ${billing.paymentStatus}`
        : `Updated invoice: ${billing.invoiceNumber}`;

    await logAudit(req, 'UPDATE', 'Billing', billing._id, detailMsg);

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
    
    await logAudit(req, 'DELETE', 'Billing', billing._id, `Soft deleted invoice: ${billing.invoiceNumber}`);

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
