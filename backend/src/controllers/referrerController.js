const Referrer = require('../models/Referrer');
const Lead = require('../models/Lead');

// @desc    Get all referrers
// @route   GET /api/referrers
// @access  Private
exports.getReferrers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        // Build query with Tenant Isolation
        // Use companyFilter from middleware, or default to empty (Super Admin see all)
        // If middleware is missing or bypassed, we might have issue, but assume tenantMiddleware runs.
        const query = { ...(req.companyFilter || {}), isDeleted: false };
        
        // Additional User Isolation if desired? User request says "depend on company wise". 
        // "on that referer is belonhs to the company oly all the referer will be able to see super admin" 
        // -> Implies Company Isolation. Super Admin sees all (handled by middleware usually if query param not set or handled by custom logic).
        
        // Note: middleware logic for Super Admin:
        // If query.company set -> filter by that.
        // If not set -> empty filter (sees all).
        
        // For Regular User -> Enforces company ID.
        
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
            .populate('company', 'name')
            .populate('createdBy', 'name')
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
// @access  Private
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

        // Check Permissions (Tenant Isolation)
        if (req.user.role?.roleName !== 'Super Admin') {
             const userCompanyId = req.user.company?._id || req.user.company;
             const referrerCompanyId = referrer.company?._id || referrer.company;
             
             if (!userCompanyId || (referrerCompanyId && referrerCompanyId.toString() !== userCompanyId.toString())) {
                 return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
             }
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
// @access  Private
exports.createReferrer = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            console.error('Referrer Creation Error: User object missing or session expired', req.user);
            return res.status(401).json({
                success: false,
                message: 'Your session has expired. Please log in again.'
            });
        }
        
        // Company ID is injected by middleware if not Super Admin. 
        // If Super Admin, middleware injects from body or header context.
        // Just ensure createdBy is set
        req.body.createdBy = req.user._id;

        // Ensure company is present (double safeguard)
        if (!req.body.company && req.user.company) {
             req.body.company = req.user.company._id || req.user.company;
        }

        if (!req.body.company) {
             return res.status(400).json({
                success: false,
                message: 'Company context is required'
             });
        }

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
// @access  Private
exports.updateReferrer = async (req, res, next) => {
    try {
        let referrer = await Referrer.findOne({ _id: req.params.id, isDeleted: false });

        if (!referrer) {
             return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }

        // Check Permissions
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            if (!req.user.company || (referrer.company && referrer.company.toString() !== req.user.company._id.toString())) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }
        }

        referrer = await Referrer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
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
// @access  Private
exports.deleteReferrer = async (req, res, next) => {
    try {
        const referrer = await Referrer.findOne({ _id: req.params.id, isDeleted: false });

        if (!referrer) {
             return res.status(404).json({
                success: false,
                message: 'Referrer not found'
            });
        }
        
        // Check Permissions
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            if (!req.user.company || (referrer.company && referrer.company.toString() !== req.user.company._id.toString())) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }
        }

        referrer.isDeleted = true;
        await referrer.save();
        
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
// @access  Private
exports.getReferrerStats = async (req, res, next) => {
    try {
        // Isolate Stats by Company
        const query = { ...(req.companyFilter || {}), isDeleted: false };

        const totalReferrers = await Referrer.countDocuments(query);
        const activeReferrers = await Referrer.countDocuments({ ...query, isActive: true });
        
        // Get total leads referred (Need to join with Referrers or check Leads that refer to VALID referrers in this company?)
        // Issue: Leads store `referredBy` as ObjectId of Referrer.
        // We know Referrers in this company.
        // So we should find Leads where referredBy IN [List of Referrers in this Company].
        // OR, if Leads also have `company` field (they do), we can just filter Leads by company.
        // Assumption: A lead in Company A is referred by a Referrer in Company A.
        
        const leadQuery = { ...(req.companyFilter || {}), isDeleted: false, referredBy: { $exists: true, $ne: null } };

        const totalLeadsReferred = await Lead.countDocuments(leadQuery);
        
        // Get converted leads
        const convertedLeads = await Lead.countDocuments({ 
            ...leadQuery,
            status: 'Converted'
        });
        
        // Calculate average conversion rate
        const avgConversionRate = totalLeadsReferred > 0 
            ? ((convertedLeads / totalLeadsReferred) * 100).toFixed(2)
            : 0;
        
        // Get recent referrals (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentReferrals = await Lead.countDocuments({
            ...leadQuery,
            createdAt: { $gte: sevenDaysAgo }
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
// @access  Private
exports.getReferrerStatsById = async (req, res, next) => {
    try {
        // Find Referrer & Check Permission
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
        
         // Check Permissions
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            const userCompanyId = req.user.company?._id || req.user.company;
            const referrerCompanyId = referrer.company?._id || referrer.company;

            if (!userCompanyId || (referrerCompanyId && referrerCompanyId.toString() !== userCompanyId.toString())) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }
        }

        // Get total leads referred by this referrer
        // Leads should also be in the same company, but just checking referrer ID is usually enough if IDs are unique.
        // But for safety/correctness, we'll trust the ID link.
        const leadQuery = { referredBy: req.params.id, isDeleted: false };
        
        const totalLeads = await Lead.countDocuments(leadQuery);
        
        // Get active leads (not converted or lost)
        const activeLeads = await Lead.countDocuments({ 
            ...leadQuery,
            status: { $nin: ['Converted', 'Lost'] }
        });
        
        // Get converted leads
        const convertedLeads = await Lead.countDocuments({ 
            ...leadQuery,
            status: 'Converted'
        });
        
        // Get lost leads
        const lostLeads = await Lead.countDocuments({ 
            ...leadQuery,
            status: 'Lost'
        });
        
        // Calculate conversion percentage
        const conversionPercentage = totalLeads > 0 
            ? ((convertedLeads / totalLeads) * 100).toFixed(2)
            : 0;
        
        // Get last lead date
        const lastLead = await Lead.findOne(leadQuery).sort({ createdAt: -1 });
        
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
// @access  Private
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
        
        // Check Permissions
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            if (!req.user.company || (referrer.company && referrer.company.toString() !== req.user.company._id.toString())) {
                return res.status(404).json({
                    success: false,
                    message: 'Referrer not found'
                });
            }
        }
        
        const query = { 
            referredBy: req.params.id,
            isDeleted: false 
        };

        const leads = await Lead.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await Lead.countDocuments(query);
        
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
