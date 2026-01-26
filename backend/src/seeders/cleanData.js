const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const Referrer = require('../models/Referrer');
const Company = require('../models/Company');

dotenv.config();

const cleanData = async () => {
    try {
        await connectDB();
        console.log('Database connected for cleaning...');

        // Delete Transactional Data
        await Lead.deleteMany({});
        console.log('Leads deleted.');

        await Contact.deleteMany({});
        console.log('Contacts deleted.');

        await Activity.deleteMany({});
        console.log('Activities deleted.');

        await FollowUp.deleteMany({});
        console.log('FollowUps deleted.');

        await Referrer.deleteMany({});
        console.log('Referrers deleted.');
        
        await Company.deleteMany({});
        console.log('Companies deleted.');

        console.log('-----------------------------------');
        console.log('Data cleaning completed successfully.');
        console.log('Essentials (Users, Roles, Permissions) were PRESERVED.');
        console.log('-----------------------------------');
        process.exit();
    } catch (error) {
        console.error('Data cleaning failed:', error);
        process.exit(1);
    }
};

cleanData();
