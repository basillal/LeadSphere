const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Organization = require('./src/models/Organization');

dotenv.config();

const fixRoles = async () => {
    try {
        await connectDB();
        console.log('DB Connected');

        const organizationAdminRole = await Role.findOne({ roleName: 'Organization Admin' });
        if (!organizationAdminRole) {
            console.error('Organization Admin role not found. Run seeder first.');
            process.exit(1);
        }

        // Find all Companies
        const companies = await Organization.find({});
        console.log(`Checking ${companies.length} companies for owner roles...`);

        for (const organization of companies) {
            if (!organization.owner) continue;
            
            const owner = await User.findById(organization.owner);
            if (owner) {
                // Check if owner has a role
                let needsSave = false;
                
                if (!owner.role) {
                    console.log(`Assigning Role to: ${owner.email} (${organization.name})`);
                    owner.role = organizationAdminRole._id;
                    needsSave = true;
                }

                // Check invalid password (shim for validation error)
                if (!owner.password) {
                     console.log(`Fixing missing password for: ${owner.email}`);
                     owner.password = 'Password123!';
                     needsSave = true;
                }
                
                if (needsSave) {
                    await owner.save();
                } else {
                     // Check if role matches what we expect?
                     // console.log(`User ${owner.email} already has role: ${owner.role}`);
                }
            }
        }

        console.log('Role fix complete.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixRoles();
