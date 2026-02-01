const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const Referrer = require('../models/Referrer');
const Company = require('../models/Company');
const User = require('../models/User');
const Role = require('../models/Role');
const Service = require('../models/Service');
const Billing = require('../models/Billing');
const Expense = require('../models/Expense');

dotenv.config();

const cleanData = async () => {
    try {
        await connectDB();
        console.log('Database connected for cleaning...');

        const args = process.argv.slice(2);
        const shouldCleanAll = args.length === 0 || args.includes('--all');

        const collectionsToClean = {
            leads: shouldCleanAll || args.includes('--leads'),
            contacts: shouldCleanAll || args.includes('--contacts'),
            activities: shouldCleanAll || args.includes('--activities'),
            followUps: shouldCleanAll || args.includes('--follow-ups'),
            referrers: shouldCleanAll || args.includes('--referrers'),
            companies: shouldCleanAll || args.includes('--companies'),
            services: shouldCleanAll || args.includes('--services'),
            billing: shouldCleanAll || args.includes('--billing'),
            expenses: shouldCleanAll || args.includes('--expenses'),
            users: shouldCleanAll || args.includes('--users'),
            roles: shouldCleanAll || args.includes('--roles')
        };

        // Delete Transactional Data
        if (collectionsToClean.leads) {
            await Lead.deleteMany({});
            console.log('Leads deleted.');
        }

        if (collectionsToClean.contacts) {
            await Contact.deleteMany({});
            console.log('Contacts deleted.');
        }

        if (collectionsToClean.activities) {
            await Activity.deleteMany({});
            console.log('Activities deleted.');
        }

        if (collectionsToClean.followUps) {
            await FollowUp.deleteMany({});
            console.log('FollowUps deleted.');
        }

        if (collectionsToClean.referrers) {
            await Referrer.deleteMany({});
            console.log('Referrers deleted.');
        }
        
        if (collectionsToClean.companies) {
            await Company.deleteMany({});
            console.log('Companies deleted.');
        }

        if (collectionsToClean.services) {
            await Service.deleteMany({});
            console.log('Services deleted.');
        }

        if (collectionsToClean.billing) {
            await Billing.deleteMany({});
            console.log('Billing/Invoices deleted.');
        }

        if (collectionsToClean.expenses) {
            await Expense.deleteMany({});
            console.log('Expenses deleted.');
        }

        // Delete Users except Admin
        if (collectionsToClean.users) {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@leadsphere.com';
            await User.deleteMany({ email: { $ne: adminEmail } });
            console.log('Non-admin users deleted.');
        }

        // Delete Roles except System Roles
        if (collectionsToClean.roles) {
            await Role.deleteMany({ isSystemRole: false });
            console.log('Custom roles deleted.');
        }

        console.log('-----------------------------------');
        console.log('Data cleaning completed successfully.');
        if (collectionsToClean.users) {
             const adminEmail = process.env.ADMIN_EMAIL || 'admin@leadsphere.com';
             console.log(`Preserved Admin: ${adminEmail}`);
        }
        if (collectionsToClean.roles) {
            console.log('System Roles Preserved.');
        }
        console.log('-----------------------------------');
        process.exit();
    } catch (error) {
        console.error('Data cleaning failed:', error);
        process.exit(1);
    }
};

cleanData();
