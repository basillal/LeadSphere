const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

dotenv.config();

const resources = ['LEAD', 'CONTACT', 'FOLLOWUP', 'ACTIVITY', 'REFERRER'];
const actions = ['READ', 'CREATE', 'UPDATE', 'DELETE'];

const permissionsList = [];
resources.forEach(resource => {
    actions.forEach(action => {
        permissionsList.push({
            permissionName: `${resource}_${action}`,
            resource: resource,
            method: action === 'READ' ? 'GET' : action === 'CREATE' ? 'POST' : action === 'UPDATE' ? 'PUT' : 'DELETE',
            description: `Permission to ${action.toLowerCase()} ${resource.toLowerCase()}s`
        });
    });
});

// Add special permissions
permissionsList.push(
    { permissionName: 'ROLE_MANAGE', resource: 'ROLE', method: 'ANY', description: 'Manage Roles' },
    { permissionName: 'PERMISSION_MANAGE', resource: 'PERMISSION', method: 'ANY', description: 'Manage Permissions' },
    { permissionName: 'USER_MANAGE', resource: 'USER', method: 'ANY', description: 'Manage Users' }
);

const seedAuth = async () => {
    try {
        await connectDB();
        console.log('Database connected for seeding...');

        // 1. Create Permissions
        const permissionIds = {};
        for (const perm of permissionsList) {
            const existingPerm = await Permission.findOne({ permissionName: perm.permissionName });
            if (existingPerm) {
                permissionIds[perm.permissionName] = existingPerm._id;
            } else {
                const newPerm = await Permission.create(perm);
                permissionIds[perm.permissionName] = newPerm._id;
            }
        }
        console.log('Permissions seeded.');

        // 2. Create Roles
        // Super Admin gets ALL permissions
        let superAdminRole = await Role.findOne({ roleName: 'Super Admin' });
        if (!superAdminRole) {
            superAdminRole = await Role.create({
                roleName: 'Super Admin',
                permissions: Object.values(permissionIds),
                isSystemRole: true,
                description: 'Has access to everything'
            });
            console.log('Super Admin Role created.');
        } else {
             // Update permissions ensures Super Admin always has all
             superAdminRole.permissions = Object.values(permissionIds);
             await superAdminRole.save();
             console.log('Super Admin Role permissions updated.');
        }

        // Company Admin Role
        let companyAdminRole = await Role.findOne({ roleName: 'Company Admin' });
        if (!companyAdminRole) {
            // All standard resource permissions + USER_MANAGE
            const companyAdminPerms = Object.values(permissionIds).filter(id => {
                // Get permission object to check name?
                // permissionIds is Map: "NAME" -> ObjectId
                // We need to filter based on name key.
                return true; // Wait, we need keys.
            });
            // Better way:
            const companyAdminPermKeys = Object.keys(permissionIds).filter(key => 
                !['ROLE_MANAGE', 'PERMISSION_MANAGE'].includes(key)
            );
            const companyAdminPermIds = companyAdminPermKeys.map(key => permissionIds[key]);

            companyAdminRole = await Role.create({
                roleName: 'Company Admin',
                permissions: companyAdminPermIds,
                isSystemRole: true,
                description: 'Admin for a specific company'
            });
            console.log('Company Admin Role created.');
        }

        // Basic User Role (Read only for Leads) - Example
        let userRole = await Role.findOne({ roleName: 'User' });
        if (!userRole) {
            const userPerms = [
                permissionIds['LEAD_READ'], 
                permissionIds['LEAD_CREATE'], // Allow create
                permissionIds['LEAD_UPDATE'],
                permissionIds['CONTACT_READ'], 
                permissionIds['CONTACT_CREATE'],
                permissionIds['ACTIVITY_READ'],
                permissionIds['ACTIVITY_CREATE'],
                permissionIds['FOLLOWUP_READ'],
                permissionIds['FOLLOWUP_CREATE'],
                // Add more as needed for basic functionality
            ];
            userRole = await Role.create({
                roleName: 'User',
                permissions: userPerms.filter(id => id), 
                isSystemRole: false,
                description: 'Standard user'
            });
            console.log('User Role created.');
        }

        // 3. Create Default Company (Required for Super Admin)
        const Company = require('../models/Company');
        let defaultCompany = await Company.findOne({ name: 'LeadSphere Inc.' });
        if (!defaultCompany) {
            // We need an owner for the company. Use a placeholder ID first or the admin ID if we can predict it?
            // Circular dependency: User needs Company, Company needs Owner(User).
            // Solution: Create User without Company first (temporarily bypass validation if needed by schema, but schema says ref 'Company' is not strictly required at DB level unless validation logic enforces it).
            // If User schema has required: true for company, we might have issue. 
            // Checking User model: company is NOT required.
            
            // Wait, we need the Admin User ID to set as owner.
            // AND we need Company ID to set on User.
            // Let's create Admin User first without company.
        }

        // 3. Create Super Admin User & Default Company
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@leadsphere.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        let adminUser = await User.findOne({ email: adminEmail });
        
        // Ensure Default Company Exists
        if (!defaultCompany) {
             // Create admin user first if not exists (to be owner)
             if (!adminUser) {
                 adminUser = await User.create({
                    name: 'Super Admin',
                    email: adminEmail,
                    password: adminPassword,
                    role: superAdminRole._id, // Will update company later
                    isActive: true
                });
                console.log(`Super Admin User created (temp): ${adminEmail}`);
             }

             defaultCompany = await Company.create({
                 name: 'LeadSphere Inc.',
                 owner: adminUser._id,
                 plan: 'Enterprise',
                 isActive: true
             });
             console.log('Default Company (LeadSphere Inc.) created.');
        }

        // Now ensure Admin User has the company and role
        if (!adminUser) {
             // Should have been created above if not exists, but if default company DID exist but user didn't?
             adminUser = await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: superAdminRole._id,
                company: defaultCompany._id,
                isActive: true
            });
            console.log(`Super Admin User created: ${adminEmail} / ${adminPassword}`);
        } else {
             // Update existing admin
             let needSave = false;
             if(!adminUser.role || adminUser.role.toString() !== superAdminRole._id.toString()) {
                 adminUser.role = superAdminRole._id;
                 needSave = true;
             }
             if(!adminUser.company || adminUser.company.toString() !== defaultCompany._id.toString()) {
                 adminUser.company = defaultCompany._id;
                 needSave = true;
             }
             
             // Check Password
             const isMatch = await adminUser.matchPassword(adminPassword);
             if (!isMatch) {
                 adminUser.password = adminPassword;
                 needSave = true;
                 console.log('Super Admin User password reset.');
             }

             if(needSave) {
                 await adminUser.save();
                 console.log('Super Admin User updated with correct Role/Company.');
             } else {
                 console.log('Super Admin User already up to date.');
             }
        }

        console.log('Seeding completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedAuth();
