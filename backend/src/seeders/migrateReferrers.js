const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Referrer = require('../models/Referrer');
const Organization = require('../models/Organization');
const User = require('../models/User');

dotenv.config();

const migrateReferrers = async () => {
    try {
        await connectDB();
        console.log('Database connected for migration...');

        // 1. Get Default Organization (LeadSphere Inc.)
        let defaultOrganization = await Organization.findOne({ name: 'LeadSphere Inc.' });
        if (!defaultOrganization) {
            // If doesn't exist, use the first available organization or error
            defaultOrganization = await Organization.findOne({});
        }

        if (!defaultOrganization) {
            console.error('No organization found to migrate referrers to. Please run seeder first.');
            process.exit(1);
        }

        // 2. Get Default Admin (Owner of the organization)
        const defaultAdmin = await User.findOne({ _id: defaultOrganization.owner }) || await User.findOne({ role: { $exists: true } });

        if (!defaultAdmin) {
             console.error('No user found to assign as creator.');
             process.exit(1);
        }

        // 3. Update all referrers missing organization
        const result = await Referrer.updateMany(
            { organization: { $exists: false } },
            { 
                $set: { 
                    organization: defaultOrganization._id,
                    createdBy: defaultAdmin._id
                } 
            }
        );

        console.log(`Migration completed. Modified ${result.modifiedCount} referrers.`);
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateReferrers();
