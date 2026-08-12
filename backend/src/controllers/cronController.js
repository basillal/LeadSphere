const asyncHandler = require('express-async-handler');
const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');

// @desc    Process scheduled cron jobs (e.g., overdue followups, billing checks)
// @route   POST /api/cron/process
// @access  Public (Secured via Secret Header)
const processCronJob = asyncHandler(async (req, res) => {
    // 1. Verify the request is coming from a trusted cron service (like Vercel Cron, GitHub Actions, AWS, or cron-job.org)
    const cronSecret = req.headers['x-cron-secret'] || req.headers['authorization'] || req.query.secret;
    
    // You should set CRON_SECRET in your .env file
    const expectedSecret = process.env.CRON_SECRET || 'Bearer your-secret-cron-key-here'; 

    if (cronSecret !== expectedSecret && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        res.status(401);
        throw new Error('Unauthorized: Invalid cron secret');
    }

    try {
        logger.info('Cron job execution started...');

        // --- ADD YOUR SPECIFIC CRON LOGIC HERE ---
        // For example: Checking for overdue follow-ups, processing billing, cleaning up logs.

        /* 
        // Example: Mark past due follow-ups as 'Missed' or send reminders
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const overdueFollowUps = await FollowUp.updateMany(
            { status: 'Pending', scheduledAt: { $lt: todayStart } },
            { $set: { status: 'Missed' } } 
        );
        logger.info(`Cron Job: Marked ${overdueFollowUps.modifiedCount} follow-ups as missed.`);
        */

        logger.info('Cron job executed successfully.');

        res.status(200).json({
            success: true,
            message: 'Cron job executed successfully',
        });
    } catch (error) {
        logger.error(`Cron Job Failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Cron job failed',
            error: error.message
        });
    }
});

module.exports = {
    processCronJob,
};
