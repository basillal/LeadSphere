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

        // 3. Create Super Admin User
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@leadsphere.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: superAdminRole._id,
                isActive: true
            });
            console.log(`Super Admin User created: ${adminEmail} / ${adminPassword}`);
        } else {
             // Ensure role is correct
             if(!adminUser.role || adminUser.role.toString() !== superAdminRole._id.toString()) {
                 adminUser.role = superAdminRole._id;
                 await adminUser.save();
                 console.log('Super Admin User role corrected.');
             }
             
             // FORCE RESET PASSWORD due to potential hashing issues or previous bad runs
             // We can't easily check match without async, so just overwrite it to be safe or check match
             const isMatch = await adminUser.matchPassword(adminPassword);
             if (!isMatch) {
                 adminUser.password = adminPassword; // Triggers pre-save hook
                 await adminUser.save();
                 console.log('Super Admin User password reset to default.');
             } else {
                 console.log('Super Admin User already exists and password matches.');
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
