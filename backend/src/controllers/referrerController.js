const Referrer = require('../models/Referrer');
const Lead = require('../models/Lead');

// @desc    Get all referrers
// @route   GET /api/referrers
// @access  Public
exports.getReferrers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        // Build query
        const query = { isDeleted: false };
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Execute query with pagination
        const referrers = await Referrer.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await Referrer.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: referrers,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single referrer
// @route   GET /api/referrers/:id
// @access  Public
exports.getReferrerById = async (req, res, next) => {
    try {
        const referrer = await Referrer.findOne({ 
            _id: req.params.id, 
            isDeleted: false 
        });
        
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: referrer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new referrer
// @route   POST /api/referrers
// @access  Public
exports.createReferrer = async (req, res, next) => {
    try {
        const referrer = await Referrer.create(req.body);
        
        res.status(201).json({
            success: true,
            data: referrer
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already exists'
            });
        }
        next(error);
    }
};

// @desc    Update referrer
// @route   PUT /api/referrers/:id
// @access  Public
exports.updateReferrer = async (req, res, next) => {
    try {
        const referrer = await Referrer.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: referrer
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already exists'
            });
        }
        next(error);
    }
};

// @desc    Delete referrer (soft delete)
// @route   DELETE /api/referrers/:id
// @access  Public
exports.deleteReferrer = async (req, res, next) => {
    try {
        const referrer = await Referrer.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Referrer deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get referrer statistics
// @route   GET /api/referrers/stats
// @access  Public
exports.getReferrerStats = async (req, res, next) => {
    try {
        const totalReferrers = await Referrer.countDocuments({ isDeleted: false });
        const activeReferrers = await Referrer.countDocuments({ isDeleted: false, isActive: true });
        
        // Get total leads referred
        const totalLeadsReferred = await Lead.countDocuments({ 
            referredBy: { $exists: true, $ne: null },
            isDeleted: false 
        });
        
        // Get converted leads
        const convertedLeads = await Lead.countDocuments({ 
            referredBy: { $exists: true, $ne: null },
            status: 'Converted',
            isDeleted: false 
        });
        
        // Calculate average conversion rate
        const avgConversionRate = totalLeadsReferred > 0 
            ? ((convertedLeads / totalLeadsReferred) * 100).toFixed(2)
            : 0;
        
        // Get recent referrals (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentReferrals = await Lead.countDocuments({
            referredBy: { $exists: true, $ne: null },
            createdAt: { $gte: sevenDaysAgo },
            isDeleted: false
        });
        
        res.status(200).json({
            success: true,
            data: {
                totalReferrers,
                activeReferrers,
                totalLeadsReferred,
                convertedLeads,
                avgConversionRate: parseFloat(avgConversionRate),
                recentReferrals
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get stats for specific referrer
// @route   GET /api/referrers/:id/stats
// @access  Public
exports.getReferrerStatsById = async (req, res, next) => {
    try {
        const referrer = await Referrer.findOne({ 
            _id: req.params.id, 
            isDeleted: false 
        });
        
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }
        
        // Get total leads referred by this referrer
        const totalLeads = await Lead.countDocuments({ 
            referredBy: req.params.id,
            isDeleted: false 
        });
        
        // Get active leads (not converted or lost)
        const activeLeads = await Lead.countDocuments({ 
            referredBy: req.params.id,
            status: { $nin: ['Converted', 'Lost'] },
            isDeleted: false 
        });
        
        // Get converted leads
        const convertedLeads = await Lead.countDocuments({ 
            referredBy: req.params.id,
            status: 'Converted',
            isDeleted: false 
        });
        
        // Get lost leads
        const lostLeads = await Lead.countDocuments({ 
            referredBy: req.params.id,
            status: 'Lost',
            isDeleted: false 
        });
        
        // Calculate conversion percentage
        const conversionPercentage = totalLeads > 0 
            ? ((convertedLeads / totalLeads) * 100).toFixed(2)
            : 0;
        
        // Get last lead date
        const lastLead = await Lead.findOne({ 
            referredBy: req.params.id,
            isDeleted: false 
        }).sort({ createdAt: -1 });
        
        const lastLeadDate = lastLead ? lastLead.createdAt : null;
        
        res.status(200).json({
            success: true,
            data: {
                referrer,
                stats: {
                    totalLeads,
                    activeLeads,
                    convertedLeads,
                    lostLeads,
                    conversionPercentage: parseFloat(conversionPercentage),
                    lastLeadDate
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all leads for a specific referrer
// @route   GET /api/referrers/:id/leads
// @access  Public
exports.getReferrerLeads = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const referrer = await Referrer.findOne({ 
            _id: req.params.id, 
            isDeleted: false 
        });
        
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }
        
        const leads = await Lead.find({ 
            referredBy: req.params.id,
            isDeleted: false 
        })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await Lead.countDocuments({ 
            referredBy: req.params.id,
            isDeleted: false 
        });
        
        res.status(200).json({
            success: true,
            data: leads,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};
