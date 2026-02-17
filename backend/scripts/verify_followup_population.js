const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const FollowUp = require('../src/models/FollowUp');
const Organization = require('../src/models/Organization');
const User = require('../src/models/User');
const Lead = require('../src/models/Lead');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyFollowUp = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Fetch one follow up and populate organization
        const followUp = await FollowUp.findOne()
            .populate('organization', 'name')
            .populate('lead', 'name organizationName');

        if (!followUp) {
            console.log('No follow ups found');
        } else {
            console.log('Follow Up ID:', followUp._id);
            console.log('Organization Field:', followUp.organization);
            console.log('Organization Name:', followUp.organization?.name);
            console.log('Lead Org Name:', followUp.lead?.organizationName);
            
            if (followUp.organization && followUp.organization.name) {
                 console.log('VERIFICATION SUCCESS: Organization populated correctly.');
            } else {
                 console.log('VERIFICATION FAILURE: Organization NOT populated.');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

verifyFollowUp();
