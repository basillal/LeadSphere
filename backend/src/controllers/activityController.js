const activityService = require('../services/activityService');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res) => {
    try {
        const result = await activityService.getActivities(req.query, req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
exports.getActivity = async (req, res) => {
    try {
        const activity = await activityService.getActivityById(req.params.id);
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
        // Add createdBy from authenticated user (you can modify this based on your auth setup)
        const activityData = {
            ...req.body,
            createdBy: req.body.createdBy || 'System'
        };

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
        const activity = await activityService.updateActivity(req.params.id, req.body);
        res.status(200).json({ data: activity });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res) => {
    try {
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
        const activities = await activityService.getActivitiesByRelated(relatedTo, relatedId);
        res.status(200).json({ data: activities });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
exports.getActivityStats = async (req, res) => {
    try {
        const stats = await activityService.getActivityStats();
        res.status(200).json({ data: stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
