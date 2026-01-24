const Activity = require('../models/Activity');

class ActivityService {
    // Get all activities with filters and pagination
    async getActivities(filters = {}, pagination = {}) {
        const { page = 1, limit = 10, search = '', activityType = '', status = '', relatedTo = '', sortBy = 'activityDate', sortOrder = 'desc' } = { ...filters, ...pagination };

        const query = { isDeleted: false };

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { relatedName: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // Activity type filter
        if (activityType) {
            query.activityType = activityType;
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        // Related to filter (Contact or Lead)
        if (relatedTo) {
            query.relatedTo = relatedTo;
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const activities = await Activity.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('relatedId', 'name phone email');

        const total = await Activity.countDocuments(query);

        return {
            data: activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Get activity by ID
    async getActivityById(id) {
        const activity = await Activity.findOne({ _id: id, isDeleted: false })
            .populate('relatedId', 'name phone email companyName');
        
        if (!activity) {
            throw new Error('Activity not found');
        }

        return activity;
    }

    // Create new activity
    async createActivity(activityData) {
        const activity = new Activity(activityData);
        await activity.save();
        return activity;
    }

    // Update activity
    async updateActivity(id, updateData) {
        const activity = await Activity.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { ...updateData, lastModifiedBy: updateData.createdBy },
            { new: true, runValidators: true }
        );

        if (!activity) {
            throw new Error('Activity not found');
        }

        return activity;
    }

    // Soft delete activity
    async deleteActivity(id) {
        const activity = await Activity.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        if (!activity) {
            throw new Error('Activity not found');
        }

        return { message: 'Activity deleted successfully' };
    }

    // Get activities for a specific contact or lead
    async getActivitiesByRelated(relatedTo, relatedId) {
        const activities = await Activity.find({
            relatedTo,
            relatedId,
            isDeleted: false
        }).sort({ activityDate: -1 });

        return activities;
    }

    // Get activity statistics
    async getActivityStats() {
        const total = await Activity.countDocuments({ isDeleted: false });
        
        const callLogs = await Activity.countDocuments({ 
            isDeleted: false, 
            activityType: 'Call' 
        });
        
        const meetings = await Activity.countDocuments({ 
            isDeleted: false, 
            activityType: 'Meeting' 
        });
        
        const notes = await Activity.countDocuments({ 
            isDeleted: false, 
            activityType: 'Note' 
        });

        const emails = await Activity.countDocuments({ 
            isDeleted: false, 
            activityType: 'Email' 
        });

        // Get recent activities (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentActivities = await Activity.countDocuments({
            isDeleted: false,
            activityDate: { $gte: sevenDaysAgo }
        });

        // Get pending follow-ups
        const pendingFollowUps = await Activity.countDocuments({
            isDeleted: false,
            followUpRequired: true,
            followUpDate: { $gte: new Date() }
        });

        return {
            total,
            callLogs,
            meetings,
            notes,
            emails,
            recentActivities,
            pendingFollowUps
        };
    }
}

module.exports = new ActivityService();
