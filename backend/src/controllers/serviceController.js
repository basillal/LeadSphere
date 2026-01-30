const Service = require('../models/Service');
const asyncHandler = require('express-async-handler');

// @desc    Get all services
// @route   GET /api/services
// @access  Private
const getServices = asyncHandler(async (req, res) => {
    const query = { ...(req.companyFilter || {}), isDeleted: false };
    
    // Filters
    if (req.query.industryType) {
        query.industryType = req.query.industryType;
    }
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
            { serviceName: searchRegex },
            { serviceCode: searchRegex }
        ];
    }
    if (req.query.isActive) {
        query.isActive = req.query.isActive === 'true';
    }

    const services = await Service.find(query).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: services.length,
        data: services
    });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Private
const getService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service || service.isDeleted) {
        res.status(404);
        throw new Error('Service not found');
    }

    // Check company permission
    if (req.user.role?.roleName !== 'Super Admin') {
         if (!req.user.company || (service.company && service.company.toString() !== req.user.company._id.toString())) {
             res.status(404);
             throw new Error('Service not found');
         }
    }

    res.status(200).json({
        success: true,
        data: service
    });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private
const createService = asyncHandler(async (req, res) => {
    console.log('Creating service:', req.body);
    // Check duplicates
    if (!req.body.serviceName || !req.body.baseAmount) {
        res.status(400);
        throw new Error('Please include a service name and base amount');
    }

    const companyId = req.user.company?._id || req.user.company;
    console.log('Company ID:', companyId);
    
    // Check if code exists in company
    if (req.body.serviceCode) {
        const codeExists = await Service.findOne({ 
            serviceCode: req.body.serviceCode, 
            company: companyId,
            isDeleted: false 
        });
        if (codeExists) {
            res.status(400);
            throw new Error('Service code already exists');
        }
    }

    const service = await Service.create({
        ...req.body,
        company: companyId,
        createdBy: req.user._id
    });
    
    console.log('Service created:', service);

    res.status(201).json({
        success: true,
        data: service
    });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
const updateService = asyncHandler(async (req, res) => {
    let service = await Service.findById(req.params.id);

    if (!service || service.isDeleted) {
        res.status(404);
        throw new Error('Service not found');
    }

    // Permission check
    if (req.user.role?.roleName !== 'Super Admin') {
        if (!req.user.company || (service.company && service.company.toString() !== req.user.company._id.toString())) {
            res.status(404);
            throw new Error('Service not found');
        }
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: service
    });
});

// @desc    Delete service (Soft)
// @route   DELETE /api/services/:id
// @access  Private
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

     // Permission check
     if (req.user.role?.roleName !== 'Super Admin') {
        if (!req.user.company || (service.company && service.company.toString() !== req.user.company._id.toString())) {
            res.status(404);
            throw new Error('Service not found');
        }
    }

    service.isDeleted = true;
    await service.save();

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    getServices,
    getService,
    createService,
    updateService,
    deleteService
};
