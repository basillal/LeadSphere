const activityService = require('../services/activityService');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res) => {
    try {
        const filters = { ...req.query };
        
        // Enforce Organization Scope
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            filters.organization = req.user.organization?._id || req.user.organization;
        }

        const result = await activityService.getActivities(filters, req.query);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getActivities:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
exports.getActivity = async (req, res) => {
    try {
        const activity = await activityService.getActivityById(req.params.id);
        
        // Check Access
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            const userOrganizationId = req.user.organization?._id?.toString() || req.user.organization?.toString();
            const activityOrganizationId = activity.organization?.toString(); 
            // Note: activity.organization might be ObjectId or string depending on populate
            
            if (activityOrganizationId && activityOrganizationId !== userOrganizationId) {
                return res.status(404).json({ message: 'Activity not found' });
            }
        }

        res.status(200).json({ data: activity });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
    try {
        const organizationId = req.user.organization?._id || req.user.organization;
        
        const activityData = {
            ...req.body,
            createdBy: req.user._id, // Use actual user ID
            organization: organizationId
        };

        // Sanitize service field
        if (activityData.service === "") {
            delete activityData.service;
        }

        const activity = await activityService.createActivity(activityData);
        res.status(201).json({ data: activity });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
exports.updateActivity = async (req, res) => {
    try {
        // ideally should check permission first, but service might handle it or we assume ID knowledge implies access?
        // Better to check retrieval first.
        const activity = await activityService.getActivityById(req.params.id);
        
        // Check Access
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
             const userOrganizationId = req.user.organization?._id?.toString() || req.user.organization?.toString();
            if (activity.organization?.toString() !== userOrganizationId) {
                return res.status(404).json({ message: 'Activity not found' });
            }
        }

        const updateData = { ...req.body };
        // Sanitize service field
        if (updateData.service === "") {
            updateData.service = null; // or undefined, or $unset in mongoose update if needed? 
            // Mongoose set to null usually works for optional ObjectId ref
        }

        const updatedActivity = await activityService.updateActivity(req.params.id, updateData);
        res.status(200).json({ data: updatedActivity });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res) => {
    try {
        const activity = await activityService.getActivityById(req.params.id);
         
        // Check Access
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            const userOrganizationId = req.user.organization?._id?.toString() || req.user.organization?.toString();
            if (activity.organization?.toString() !== userOrganizationId) {
                return res.status(404).json({ message: 'Activity not found' });
            }
        }

        const result = await activityService.deleteActivity(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Get activities by related contact/lead
// @route   GET /api/activities/related/:relatedTo/:relatedId
// @access  Private
exports.getActivitiesByRelated = async (req, res) => {
    try {
        const { relatedTo, relatedId } = req.params;
        
        const filters = { relatedTo, relatedId };
        // Enforce Organization Scope
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            filters.organization = req.user.organization?._id || req.user.organization;
        }

        const activities = await activityService.getActivities(filters); // Re-use main getActivities which supports filters
        res.status(200).json({ data: activities.data }); // getActivities returns { data, pagination }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
exports.getActivityStats = async (req, res) => {
    try {
        const filters = {};
         // Enforce Organization Scope
        const isSuperAdmin = req.user.role?.roleName === 'Super Admin';
        if (!isSuperAdmin) {
            filters.organization = req.user.organization?._id || req.user.organization;
        }

        const stats = await activityService.getActivityStats(filters);
        res.status(200).json({ data: stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
