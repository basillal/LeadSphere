const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const Contact = require('../models/Contact');
const Lead = require('../models/Lead');

class ActivityService {
    // Get all activities with filters and pagination
    async getActivities(filters = {}, pagination = {}) {
        const { page = 1, limit = 10, search = '', activityType = '', status = '', relatedTo = '', relatedId = '', dateFilter = '', startDate = '', endDate = '', sortBy = 'activityDate', sortOrder = 'desc', company = '' } = { ...filters, ...pagination };

        const query = { isDeleted: false };

        // Company Scope
        if (company) {
            query.company = company;
        }

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
        
        if (relatedId) {
            query.relatedId = relatedId;
        }

        // Date filter
        if (dateFilter) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            switch (dateFilter) {
                case 'today':
                    const endOfToday = new Date(today);
                    endOfToday.setDate(endOfToday.getDate() + 1);
                    query.activityDate = {
                        $gte: today,
                        $lt: endOfToday
                    };
                    break;

                case 'tomorrow':
                    const endOfTomorrow = new Date(tomorrow);
                    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
                    query.activityDate = {
                        $gte: tomorrow,
                        $lt: endOfTomorrow
                    };
                    break;

                case 'thisWeek':
                    const startOfWeek = new Date(today);
                    const dayOfWeek = startOfWeek.getDay();
                    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start of week
                    startOfWeek.setDate(startOfWeek.getDate() + diff);
                    
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(endOfWeek.getDate() + 7);
                    
                    query.activityDate = {
                        $gte: startOfWeek,
                        $lt: endOfWeek
                    };
                    break;

                case 'thisMonth':
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    
                    query.activityDate = {
                        $gte: startOfMonth,
                        $lt: endOfMonth
                    };
                    break;

                case 'overdue':
                    // Scheduled activities with dates in the past
                    query.activityDate = { $lt: today };
                    query.status = 'Scheduled';
                    break;

                case 'custom':
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setDate(end.getDate() + 1); // Include end date
                        
                        query.activityDate = {
                            $gte: start,
                            $lt: end
                        };
                    }
                    break;
            }
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const activities = await Activity.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('relatedId', 'name phone email')
            .populate('service', 'serviceName service code');

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
            .populate('relatedId', 'name phone email companyName')
            .populate('service', 'serviceName serviceCode');
        
        if (!activity) {
            throw new Error('Activity not found');
        }

        return activity;
    }

    // Create new activity
    async createActivity(activityData) {
        const activity = new Activity(activityData);
        await activity.save();

        // Create FollowUp if required
        if (activityData.followUpRequired && activityData.followUpDate) {
            try {
                let leadId = null;

                if (activityData.relatedTo === 'Lead') {
                    leadId = activityData.relatedId;
                } else if (activityData.relatedTo === 'Contact') {
                    const contact = await Contact.findById(activityData.relatedId);
                    if (contact && contact.leadId) {
                        leadId = contact.leadId;
                    }
                }

                if (leadId) {
                    await FollowUp.create({
                        lead: leadId,
                        scheduledAt: activityData.followUpDate,
                        type: 'Call', // Default, or could be inferred
                        notes: activityData.followUpNotes || `Follow up from activity: ${activity.title}`,
                        company: activityData.company,
                        createdBy: activityData.createdBy,
                        status: 'Pending'
                    });
                }
            } catch (error) {
                console.error("Error creating auto-followup:", error);
                // Don't fail the activity creation if follow-up fails, just log it
            }
        }

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
    // Deprecated: logic moved to getActivities with filters
    async getActivitiesByRelated(relatedTo, relatedId) {
        const activities = await Activity.find({
            relatedTo,
            relatedId,
            isDeleted: false
        }).sort({ activityDate: -1 });

        return activities;
    }

    // Get activity statistics
    async getActivityStats(filters = {}) {
        const baseQuery = { isDeleted: false };
        if (filters.company) baseQuery.company = filters.company;

        const total = await Activity.countDocuments(baseQuery);
        
        const callLogs = await Activity.countDocuments({ 
            ...baseQuery,
            activityType: 'Call' 
        });
        
        const meetings = await Activity.countDocuments({ 
            ...baseQuery,
            activityType: 'Meeting' 
        });
        
        const notes = await Activity.countDocuments({ 
            ...baseQuery,
            activityType: 'Note' 
        });

        const emails = await Activity.countDocuments({ 
            ...baseQuery,
            activityType: 'Email' 
        });

        // Get recent activities (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentActivities = await Activity.countDocuments({
            ...baseQuery,
            activityDate: { $gte: sevenDaysAgo }
        });

        // Get pending follow-ups
        const pendingFollowUps = await Activity.countDocuments({
            ...baseQuery,
            followUpRequired: true,
            followUpDate: { $gte: new Date() }
        });

        // Get today's activities
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(today);
        endOfToday.setDate(endOfToday.getDate() + 1);
        
        const todaysActivities = await Activity.countDocuments({
            ...baseQuery,
            activityDate: {
                $gte: today,
                $lt: endOfToday
            }
        });

        // Get overdue activities (scheduled activities with past dates)
        const overdueActivities = await Activity.countDocuments({
            ...baseQuery,
            status: 'Scheduled',
            activityDate: { $lt: today }
        });

        return {
            total,
            callLogs,
            meetings,
            notes,
            emails,
            recentActivities,
            pendingFollowUps,
            todaysActivities,
            overdueActivities
        };
    }
}

module.exports = new ActivityService();
