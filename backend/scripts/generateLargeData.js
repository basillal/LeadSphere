const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const Organization = require('../src/models/Organization');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const Lead = require('../src/models/Lead');
const Contact = require('../src/models/Contact');
const Activity = require('../src/models/Activity');
const FollowUp = require('../src/models/FollowUp');
const Expense = require('../src/models/Expense');
const Billing = require('../src/models/Billing');
const Service = require('../src/models/Service');
const Permission = require('../src/models/Permission');

// Helpers for random data
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com', 'biz.org'];
const streetNames = ['Main St', 'Park Ave', 'Oak Ln', 'Pine St', 'Maple Dr', 'Cedar Rd', 'Elm St', 'Washington Blvd', 'Lakeview Dr', 'Hillside Ave'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Real Estate', 'Retail', 'Manufacturing', 'Consulting'];

const generateName = () => `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
const generateEmail = (name) => `${name.toLowerCase().replace(' ', '.')}@${getRandomElement(domains)}`;
const generatePhone = () => `+1-${getRandomInt(200, 999)}-${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`;
const generateAddress = () => ({
    street: `${getRandomInt(100, 9999)} ${getRandomElement(streetNames)}`,
    city: getRandomElement(cities),
    state: 'State',
    zipCode: `${getRandomInt(10000, 99999)}`,
    country: 'USA'
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const createRoles = async (orgId) => {
    // Create basic roles if they don't exist
    const roles = ['Admin', 'Manager', 'Sales Rep'];
    const createdRoles = {};

    for (const roleName of roles) {
        let role = await Role.findOne({ roleName, organization: orgId });
        if (!role) {
            role = await Role.create({
                roleName,
                organization: orgId,
                description: `Default ${roleName} role`,
                scope: 'organization'
            });
        }
        createdRoles[roleName] = role._id;
    }
    return createdRoles;
};

const createUsers = async (orgId, roles) => {
    const users = [];
    const password = await bcrypt.hash('password123', 10);
    const orgSuffix = orgId.toString().slice(-4);

    const createUserIfNotExist = async (name, emailPrefix, role) => {
        const email = `${emailPrefix}.${orgSuffix}.${getRandomInt(1000,9999)}@${getRandomElement(domains)}`; // Added random int
        // Check if a user with similar pattern exists or just create new one with random suffix
        // actually simplest is just to ensure uniqueness
        
        // Let's try to find if we already created "enough" users for this org/role?
        // No, let's just create new ones with unique emails.
        
        return await User.create({
            name,
            email,
            password,
            role,
            organization: orgId
        });
    };

    // 1 Admin
    users.push(await createUserIfNotExist(generateName(), 'admin', roles['Admin']));

    // 2 Managers
    for (let i = 0; i < 2; i++) {
        users.push(await createUserIfNotExist(generateName(), `manager${i}`, roles['Manager']));
    }

    // 5 Sales Reps
    for (let i = 0; i < 5; i++) {
        users.push(await createUserIfNotExist(generateName(), `sales${i}`, roles['Sales Rep']));
    }

    return users;
};

const createServices = async (orgId, userId) => {
    const services = [
        { name: 'Web Development', code: 'WEB' },
        { name: 'SEO Optimization', code: 'SEO' },
        { name: 'Digital Marketing', code: 'DM' },
        { name: 'Consulting', code: 'CON' }
    ];
    
    const createdServices = [];
    for (const s of services) {
        // Check if exists to avoid unique index error if re-run
        const exists = await Service.findOne({ organization: orgId, serviceCode: `${s.code}-${orgId.toString().slice(-4)}` });
        if(exists) {
            createdServices.push(exists);
            continue;
        }

        createdServices.push(await Service.create({
            serviceName: s.name,
            serviceCode: `${s.code}-${orgId.toString().slice(-4)}`, // Ensure uniqueness per org
            industryType: 'IT',
            baseAmount: getRandomInt(500, 5000),
            organization: orgId,
            createdBy: userId
        }));
    }
    return createdServices;
};

const Referrer = require('../src/models/Referrer');

const createReferrers = async (orgId, userId) => {
    const referrers = [];
    const referrerCount = getRandomInt(10, 50);

    for (let i = 0; i < referrerCount; i++) {
        const name = generateName();
        const phoneNumber = generatePhone();
        
        // Check for existing referrer with same phone in this org to avoid duplicates
        const existing = await Referrer.findOne({ organization: orgId, phone: phoneNumber });
        if (existing) {
             referrers.push(existing);
             continue;
        }

        referrers.push(await Referrer.create({
            name: name,
            email: generateEmail(name),
            phone: phoneNumber,
            organizationName: `${generateName()} LLC`,
            designation: getRandomElement(['Agent', 'Partner', 'Consultant']),
            organization: orgId,
            createdBy: userId,
            isActive: true
        }));
    }
    return referrers;
};

const generateData = async () => {
    try {
    await connectDB();

    const organizations = await Organization.find();
    console.log(`Found ${organizations.length} organizations.`);

    for (const org of organizations) {
        console.log(`Processing Organization: ${org.name}...`);
        
        const roles = await createRoles(org._id);
        const users = await createUsers(org._id, roles);
        const services = await createServices(org._id, users[0]._id); // Admin creates services
        const referrers = await createReferrers(org._id, users[0]._id);
        console.log(`Created ${referrers.length} referrers.`);


        const leadStatuses = ['New', 'Pending', 'In Progress', 'On Hold', 'Completed', 'Lost', 'Converted'];
        const sources = ['Website', 'Referral', 'WhatsApp', 'Cold Call', 'Event', 'Other'];

        const leadsToCreate = getRandomInt(300, 800);
        const leads = [];

        console.log(`Generating ${leadsToCreate} leads...`);

        for (let i = 0; i < leadsToCreate; i++) {
            const assignedUser = getRandomElement(users);
            const status = getRandomElement(leadStatuses);
            
            // Random date within last 3 years
            const createdAt = getRandomDate(new Date('2023-01-01'), new Date());
            
            let source = getRandomElement(sources);
            let referrer = null;
            
            // 20% chance to be a Referral
            if (referrers.length > 0 && Math.random() < 0.2) {
                source = 'Referral';
                referrer = getRandomElement(referrers)._id;
            }

            const lead = {
                name: generateName(),
                phone: generatePhone(), // Unique constraint might fail if collisions, but unlikely with range
                 email: generateEmail(generateName()),
                organizationName: `${generateName()} Corp`,
                designation: 'Manager',
                source: source,
                source: source,
                referredBy: referrer,
                status: status,
                priority: getRandomElement(['Low', 'Medium', 'High']),
                leadTemperature: getRandomElement(['Hot', 'Warm', 'Cold']),
                followUpCount: getRandomInt(0, 5),
                dealValue: getRandomInt(1000, 50000),
                interestedProduct: getRandomElement(services).serviceName,
                organization: org._id,
                assignedTo: assignedUser._id,
                isConverted: status === 'Converted',
                createdAt: createdAt,
                updatedAt: createdAt
            };
            leads.push(lead);
        }

        // Use insertMany for speed, but handle potential duplicate phone errors (though low probability)
        let createdLeads;
        try {
            createdLeads = await Lead.insertMany(leads, { ordered: false });
        } catch (e) {
            console.log('Some duplicate leads ignored.');
            createdLeads = await Lead.find({ organization: org._id }); // Fetch all leads if insertMany partially failed
        }

        console.log(`Created ${createdLeads.length} leads.`);

        // Generate related data
        const activities = [];
        const followUps = [];
        const contacts = [];
        const expenses = [];
        const billings = [];

        for (const lead of createdLeads) {
            // Activities
            const numActivities = getRandomInt(1, 5);
            for (let j = 0; j < numActivities; j++) {
                activities.push({
                    relatedTo: 'Lead',
                    relatedId: lead._id,
                    relatedName: lead.name,
                    activityType: getRandomElement(['Call', 'Meeting', 'Email', 'Note']),
                    title: 'Follow up interaction',
                    description: 'Discussed requirements',
                    activityDate: getRandomDate(lead.createdAt, new Date()),
                    status: 'Completed',
                    organization: org._id,
                    createdBy: lead.assignedTo.toString() // Store ID as string to match schema if mixed
                });
            }

            // FollowUps
            if (lead.status !== 'Converted' && lead.status !== 'Lost') {
                followUps.push({
                    lead: lead._id,
                    scheduledAt: getRandomDate(new Date(), new Date(Date.now() + 86400000 * 7)),
                    type: 'Call',
                    status: 'Pending',
                    assignedTo: lead.assignedTo,
                    createdBy: lead.assignedTo,
                    organization: org._id
                });
            }

            // Convert Logic: if converted, create Contact and Billing
            if (lead.isConverted) {
                const now = new Date();
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const threeYearsAgo = new Date(now.getTime() - 365 * 3 * 24 * 60 * 60 * 1000);

                // Randomly assign a tag
                const rand = Math.random();
                let tag = 'Client';
                if (rand > 0.6) tag = 'Vendor';
                if (rand > 0.8) tag = 'Partner';
                if (rand > 0.95) tag = 'Friend';

                // Randomly assign lastInteractionDate
                const isRecent = Math.random() < 0.4;
                let lastInteractionDate;
                if (isRecent) {
                    lastInteractionDate = getRandomDate(sevenDaysAgo, now);
                } else {
                    lastInteractionDate = getRandomDate(threeYearsAgo, sevenDaysAgo);
                }

                const contact = {
                    leadId: lead._id,
                    organization: org._id,
                    name: lead.name,
                    phone: lead.phone,
                    email: lead.email,
                    relationshipType: 'Business',
                    tags: [tag],
                    lastInteractionDate: lastInteractionDate,
                    createdBy: lead.assignedTo,
                    status: 'Active',
                    createdAt: lead.createdAt
                };
                contacts.push(contact);
            }
        }

        // Insert Contacts first to link Billings
        let createdContacts;
        if (contacts.length > 0) {
            createdContacts = await Contact.insertMany(contacts);
            console.log(`Created ${createdContacts.length} contacts.`);
            
            for (const contact of createdContacts) {
                 // Create Billing for Contact
                 const service = getRandomElement(services);
                 const qty = getRandomInt(1, 3);
                 const total = service.baseAmount * qty;
                 
                 const crypto = require('crypto');
                 billings.push({
                     billingId: `BILL-${crypto.randomBytes(6).toString('hex')}`, // Unique ID
                     contact: contact._id,
                     organization: org._id,
                     invoiceNumber: `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
                     services: [{
                         serviceId: service._id,
                         serviceName: service.serviceName,
                         quantity: qty,
                         unitAmount: service.baseAmount,
                         totalAmount: total
                     }],
                     subtotal: total,
                     taxTotal: total * 0.1,
                     grandTotal: total * 1.1,
                     paymentStatus: getRandomElement(['PAID', 'PENDING', 'OVERDUE']),
                     billingDate: getRandomDate(contact.createdAt, new Date()),
                     createdBy: contact.createdBy
                 });
            }
        }

        // Expenses per user
        for (const user of users) {
             const numExpenses = getRandomInt(5, 20);
             for(let k=0; k<numExpenses; k++) {
                 expenses.push({
                     organization: org._id,
                     title: 'Travel/Meals',
                     amount: getRandomInt(10, 500),
                     category: getRandomElement(['Travel', 'Food', 'Office', 'Misc']),
                     expenseDate: getRandomDate(new Date('2023-01-01'), new Date()),
                     createdBy: user._id
                 });
             }
        }

        if (activities.length > 0) await Activity.insertMany(activities);
        if (followUps.length > 0) await FollowUp.insertMany(followUps);
        if (expenses.length > 0) await Expense.insertMany(expenses);
        if (billings.length > 0) await Billing.insertMany(billings);

        console.log(`Created ${activities.length} activities.`);
        console.log(`Created ${followUps.length} follow-ups.`);
        console.log(`Created ${expenses.length} expenses.`);
        console.log(`Created ${billings.length} billings.`);
    }

    } catch (error) {
        console.error('FATAL ERROR:', error);
        const fs = require('fs');
        fs.writeFileSync('generation_error.log', error.stack);
        process.exit(1);
    }

    console.log('Data Generation Completed!');
    process.exit(0);
};

generateData();
