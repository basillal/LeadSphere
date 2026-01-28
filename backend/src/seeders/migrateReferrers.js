const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Referrer = require('../models/Referrer');
const Company = require('../models/Company');
const User = require('../models/User');

dotenv.config();

const migrateReferrers = async () => {
    try {
        await connectDB();
        console.log('Database connected for migration...');

        // 1. Get Default Company (LeadSphere Inc.)
        let defaultCompany = await Company.findOne({ name: 'LeadSphere Inc.' });
        if (!defaultCompany) {
            // If doesn't exist, use the first available company or error
            defaultCompany = await Company.findOne({});
        }

        if (!defaultCompany) {
            console.error('No company found to migrate referrers to. Please run seeder first.');
            process.exit(1);
        }

        // 2. Get Default Admin (Owner of the company)
        const defaultAdmin = await User.findOne({ _id: defaultCompany.owner }) || await User.findOne({ role: { $exists: true } });

        if (!defaultAdmin) {
             console.error('No user found to assign as creator.');
             process.exit(1);
        }

        // 3. Update all referrers missing company
        const result = await Referrer.updateMany(
            { company: { $exists: false } },
            { 
                $set: { 
                    company: defaultCompany._id,
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
