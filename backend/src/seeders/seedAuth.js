const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

dotenv.config();

// Added SERVICE, BILLING, REPORT, EXPENSE
const resources = ['LEAD', 'CONTACT', 'FOLLOWUP', 'ACTIVITY', 'REFERRER', 'SERVICE', 'BILLING', 'REPORT', 'DASHBOARD', 'EXPENSE', 'AUDITLOG'];
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

        // 1. Create/Update Permissions
        const permissionIds = {};
        for (const perm of permissionsList) {
            let existingPerm = await Permission.findOne({ permissionName: perm.permissionName });
            if (!existingPerm) {
                existingPerm = await Permission.create(perm);
                console.log(`Created permission: ${perm.permissionName}`);
            }
            permissionIds[perm.permissionName] = existingPerm._id;
        }
        console.log('Permissions seeded.');

        // 2. Create/Update Roles
        
        // --- Super Admin ---
        let superAdminRole = await Role.findOne({ roleName: 'Super Admin' });
        const allPermissionIds = Object.values(permissionIds);
        
        if (!superAdminRole) {
            superAdminRole = await Role.create({
                roleName: 'Super Admin',
                permissions: allPermissionIds,
                isSystemRole: true,
                description: 'Has access to everything'
            });
            console.log('Super Admin Role created.');
        } else {
             superAdminRole.permissions = allPermissionIds;
             await superAdminRole.save();
             console.log('Super Admin Role updated.');
        }

        // --- Company Admin ---
        let companyAdminRole = await Role.findOne({ roleName: 'Company Admin' });
        // All permissions EXCEPT permission management (Company Admin can manage roles now)
        const companyAdminPermKeys = Object.keys(permissionIds).filter(key => 
            !['PERMISSION_MANAGE'].includes(key)
        );
        const companyAdminPermIds = companyAdminPermKeys.map(key => permissionIds[key]);

        if (!companyAdminRole) {
            companyAdminRole = await Role.create({
                roleName: 'Company Admin',
                permissions: companyAdminPermIds,
                isSystemRole: true,
                description: 'Admin for a specific company'
            });
            console.log('Company Admin Role created.');
        } else {
            companyAdminRole.permissions = companyAdminPermIds;
            await companyAdminRole.save();
            console.log('Company Admin Role updated.');
        }

        // --- Basic User ---
        let userRole = await Role.findOne({ roleName: 'User' });
        const userPerms = [
            permissionIds['LEAD_READ'], 
            permissionIds['LEAD_CREATE'], 
            permissionIds['LEAD_UPDATE'],
            permissionIds['CONTACT_READ'], 
            permissionIds['CONTACT_CREATE'],
            permissionIds['ACTIVITY_READ'],
            permissionIds['ACTIVITY_CREATE'],
            permissionIds['FOLLOWUP_READ'],
            permissionIds['FOLLOWUP_CREATE'],
            permissionIds['REFERRER_READ'],
            // New Modules - Read/Create access
            permissionIds['SERVICE_READ'],
            permissionIds['BILLING_READ'],
            permissionIds['BILLING_CREATE'], // Allow billing creation? Assuming yes.
            permissionIds['REPORT_READ'],
            permissionIds['REPORT_READ'],
            permissionIds['DASHBOARD_READ'],
            permissionIds['EXPENSE_READ'],
            permissionIds['EXPENSE_CREATE'],
        ];

        const finalUserPerms = userPerms.filter(id => id); // Filter undefined

        if (!userRole) {
            userRole = await Role.create({
                roleName: 'User',
                permissions: finalUserPerms, 
                isSystemRole: false,
                accessibleByCompanyAdmin: true,
                description: 'Standard user'
            });
            console.log('User Role created.');
        } else {
            // Update standard user role permissions to include new features
            userRole.permissions = finalUserPerms;
            userRole.accessibleByCompanyAdmin = true;
            await userRole.save();
            console.log('User Role updated.');
        }

        // 3. Create Default Company (Required for Super Admin)
        const Company = require('../models/Company');
        let defaultCompany = await Company.findOne({ name: 'LeadSphere Inc.' });
        
        // 4. Create Super Admin User
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@leadsphere.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        let adminUser = await User.findOne({ email: adminEmail });
        
        if (!defaultCompany) {
             if (!adminUser) {
                 adminUser = await User.create({
                    name: 'Super Admin',
                    email: adminEmail,
                    password: adminPassword,
                    role: superAdminRole._id,
                    isActive: true
                });
             }
             defaultCompany = await Company.create({
                 name: 'LeadSphere Inc.',
                 owner: adminUser._id,
                 plan: 'Enterprise',
                 isActive: true,
                 phone: '+91 98765 43210',
                 email: 'support@leadsphere.com',
                 website: 'https://leadsphere.com',
                 description: 'LeadSphere is a premier lead management solution designed to help businesses track, manage, and convert leads efficiently.',
                 address: {
                     street: '123 Business Park, Tech Hub',
                     city: 'Bengaluru',
                     state: 'Karnataka',
                     zipCode: '560100',
                     country: 'India'
                 },
                 settings: {
                     currency: 'INR',
                     timezone: 'Asia/Kolkata',
                     logo: 'https://cdn-icons-png.flaticon.com/512/2702/2702602.png' // Professional placeholder logo
                 }
             });
             console.log('Default Company created.');
        }

        if (!adminUser) {
             adminUser = await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPassword,
                role: superAdminRole._id,
                company: defaultCompany._id,
                isActive: true
            });
            console.log(`Super Admin User created: ${adminEmail}`);
        } else {
             let needSave = false;
             if(!adminUser.role || adminUser.role.toString() !== superAdminRole._id.toString()) {
                 adminUser.role = superAdminRole._id;
                 needSave = true;
             }
             if(!adminUser.company || adminUser.company.toString() !== defaultCompany._id.toString()) {
                 adminUser.company = defaultCompany._id;
                 needSave = true;
             }
             const isMatch = await adminUser.matchPassword(adminPassword);
             if (!isMatch) {
                 adminUser.password = adminPassword;
                 needSave = true;
             }

             if(needSave) {
                 await adminUser.save();
                 console.log('Super Admin User updated.');
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
