const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const Organization = require('../src/models/Organization');
const User = require('../src/models/User');
const Role = require('../src/models/Role');
const Permission = require('../src/models/Permission');
const LeadCategory = require('../src/models/LeadCategory');
const Service = require('../src/models/Service');
const Referrer = require('../src/models/Referrer');
const Lead = require('../src/models/Lead');
const FollowUp = require('../src/models/FollowUp');
const Activity = require('../src/models/Activity');
const Contact = require('../src/models/Contact');
const Billing = require('../src/models/Billing');
const Expense = require('../src/models/Expense');
const AuditLog = require('../src/models/AuditLog');

// Helper utilities
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// 10 Distinct Organizations Definition
const organizationDefinitions = [
    {
        code: 'NEXUS',
        name: 'Nexus Technologies Inc.',
        description: 'Enterprise Cloud Solutions, DevOps & Microservices Architecture Provider.',
        industry: 'IT',
        plan: 'Enterprise',
        email: 'contact@nexustechnologies.io',
        phone: '+1-415-555-0101',
        website: 'https://nexustechnologies.io',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '500 Howard Street, Suite 400',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
        },
        services: [
            { name: 'Cloud Migration & Modernization', code: 'NEX-CLD', amount: 8500, tax: 10, desc: 'Full-cycle enterprise AWS & Azure cloud infrastructure transition.' },
            { name: 'Kubernetes Platform Engineering', code: 'NEX-K8S', amount: 6200, tax: 10, desc: 'Production-ready container orchestration setup and GitOps workflows.' },
            { name: 'DevSecOps Automation Audit', code: 'NEX-SEC', amount: 4500, tax: 10, desc: 'Automated CI/CD security scanning, SAST/DAST integration, compliance.' },
            { name: '24/7 Site Reliability Management', code: 'NEX-SRE', amount: 3800, tax: 10, desc: 'Ongoing proactive uptime monitoring, SLO/SLA management, incident triage.' }
        ]
    },
    {
        code: 'APEX',
        name: 'Apex Health Systems',
        description: 'Next-Generation HealthTech, Telemedicine and HIPAA Compliant Software.',
        industry: 'Healthcare',
        plan: 'Enterprise',
        email: 'info@apexhealthsystems.com',
        phone: '+1-617-555-0102',
        website: 'https://apexhealthsystems.com',
        currency: 'USD',
        timezone: 'America/New_York',
        logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '750 Longwood Avenue, Floor 8',
            city: 'Boston',
            state: 'MA',
            zipCode: '02115',
            country: 'USA'
        },
        services: [
            { name: 'Telehealth Mobile App Suite', code: 'APX-TELE', amount: 9500, tax: 8, desc: 'End-to-end patient-doctor video consultation and prescription platform.' },
            { name: 'HIPAA & FHIR EHR Integration', code: 'APX-FHIR', amount: 7200, tax: 8, desc: 'Bi-directional electronic health record syncing via FHIR standards.' },
            { name: 'AI Radiology Diagnostics Tool', code: 'APX-AIRAD', amount: 12000, tax: 8, desc: 'Computer vision assisted anomaly detection for medical imaging.' },
            { name: 'Patient Billing & Insurance Gateway', code: 'APX-BILL', amount: 4900, tax: 8, desc: 'Automated claims processing and real-time co-pay estimation engine.' }
        ]
    },
    {
        code: 'ZENITH',
        name: 'Zenith Capital Advisors',
        description: 'Quantitative Portfolio Management, M&A Advisory and FinTech Analytics.',
        industry: 'Finance',
        plan: 'Enterprise',
        email: 'advisory@zenithcapital.co.uk',
        phone: '+44-20-7946-0103',
        website: 'https://zenithcapital.co.uk',
        currency: 'GBP',
        timezone: 'Europe/London',
        logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '25 Bank Street, Canary Wharf',
            city: 'London',
            state: 'Greater London',
            zipCode: 'E14 5JP',
            country: 'United Kingdom'
        },
        services: [
            { name: 'Algorithmic Risk Modeling', code: 'ZEN-RISK', amount: 11000, tax: 20, desc: 'Monte Carlo simulations and stress-testing for macro asset portfolios.' },
            { name: 'FinTech Open Banking API Suite', code: 'ZEN-OPEN', amount: 8000, tax: 20, desc: 'PSD2 compliant account aggregation and instantaneous payment rails.' },
            { name: 'M&A Valuation & Due Diligence', code: 'ZEN-MNA', amount: 15000, tax: 20, desc: 'Comprehensive financial health audit and discounted cash flow modeling.' },
            { name: 'Regulatory Compliance Reporting', code: 'ZEN-REG', amount: 5500, tax: 20, desc: 'Automated FCA and SEC compliant quarterly transaction auditing.' }
        ]
    },
    {
        code: 'HORIZON',
        name: 'Horizon Freight & Logistics',
        description: 'Global Multimodal Supply Chain Optimization, Fleet Telematics and Customs Clearance.',
        industry: 'Other',
        plan: 'Pro',
        email: 'dispatch@horizonfreight.net',
        phone: '+1-312-555-0104',
        website: 'https://horizonfreight.net',
        currency: 'USD',
        timezone: 'America/Chicago',
        logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '1200 S Michigan Ave',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60605',
            country: 'USA'
        },
        services: [
            { name: 'Intermodal Freight Coordination', code: 'HRZ-FRT', amount: 5200, tax: 6, desc: 'Cross-border container scheduling across ocean, rail and freight trucks.' },
            { name: 'IoT Fleet Telematics & Tracking', code: 'HRZ-TEL', amount: 3400, tax: 6, desc: 'Real-time GPS vehicle diagnostics, temperature sensors and route engine.' },
            { name: 'Automated Customs Brokerage', code: 'HRZ-CUST', amount: 2800, tax: 6, desc: 'Fast-track tariff documentation and international port manifest filing.' },
            { name: 'Smart Cold Chain Warehousing', code: 'HRZ-COLD', amount: 6500, tax: 6, desc: 'Climate-controlled automated storage and order fulfillment logistics.' }
        ]
    },
    {
        code: 'SOLARIS',
        name: 'Solaris Renewable Energy',
        description: 'Utility-Scale Solar Farms, Battery Energy Storage Systems & Green Microgrids.',
        industry: 'Other',
        plan: 'Enterprise',
        email: 'sales@solarisenergy.com',
        phone: '+1-512-555-0105',
        website: 'https://solarisenergy.com',
        currency: 'USD',
        timezone: 'America/Chicago',
        logo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '300 West 6th Street, Suite 900',
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'USA'
        },
        services: [
            { name: 'Commercial Solar PV Installation', code: 'SOL-PV', amount: 14500, tax: 8, desc: 'High-efficiency monocrystalline rooftop and carport solar arrays.' },
            { name: 'BESS Industrial Battery Storage', code: 'SOL-BESS', amount: 18000, tax: 8, desc: 'Megawatt-hour scale battery energy storage system and peak shaving.' },
            { name: 'Microgrid Energy Management System', code: 'SOL-EMS', amount: 7600, tax: 8, desc: 'AI-driven dynamic grid balancing and self-healing power controls.' },
            { name: 'Carbon Credit Audit & Certification', code: 'SOL-CRD', amount: 4200, tax: 8, desc: 'Renewable energy certificates (REC) validation and offset trading.' }
        ]
    },
    {
        code: 'VANGUARD',
        name: 'Vanguard Realty Partners',
        description: 'Prime Commercial Real Estate, Luxury Residential Developments and Property Asset Management.',
        industry: 'Real Estate',
        plan: 'Enterprise',
        email: 'properties@vanguardrealty.com',
        phone: '+1-212-555-0106',
        website: 'https://vanguardrealty.com',
        currency: 'USD',
        timezone: 'America/New_York',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '350 Fifth Avenue, 42nd Floor',
            city: 'New York',
            state: 'NY',
            zipCode: '10118',
            country: 'USA'
        },
        services: [
            { name: 'Commercial Lease Acquisition', code: 'VAN-LSE', amount: 12500, tax: 9, desc: 'Tenant representation, prime office sourcing and lease term structuring.' },
            { name: 'Property Management & Facility Ops', code: 'VAN-FAC', amount: 5800, tax: 9, desc: 'Full-service tenant relations, maintenance contracting and rent collection.' },
            { name: 'Real Estate Capital Feasibility Study', code: 'VAN-CAP', amount: 9000, tax: 9, desc: 'Demographic analysis, cap rate projections and zoning compliance.' },
            { name: 'Virtual 3D Reality Property Staging', code: 'VAN-VR', amount: 3200, tax: 9, desc: 'Photorealistic digital walkthroughs, lidar scanning and drone surveying.' }
        ]
    },
    {
        code: 'PINNACLE',
        name: 'Pinnacle EduTech Solutions',
        description: 'Adaptive AI Learning Management Systems, Virtual Classrooms and Higher Ed STEM Curricula.',
        industry: 'Education',
        plan: 'Pro',
        email: 'partners@pinnacleedutech.in',
        phone: '+91-80-5555-0107',
        website: 'https://pinnacleedutech.in',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        logo: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '14 Outer Ring Road, Manyata Tech Park',
            city: 'Bengaluru',
            state: 'Karnataka',
            zipCode: '560045',
            country: 'India'
        },
        services: [
            { name: 'Enterprise LMS Campus Deployment', code: 'PIN-LMS', amount: 250000, tax: 18, desc: 'Full university white-label LMS with single sign-on and grading books.' },
            { name: 'Interactive STEM Virtual Labs', code: 'PIN-LAB', amount: 180000, tax: 18, desc: 'Simulated physics, chemistry and computer engineering laboratory modules.' },
            { name: 'AI Proctoring & Examination Suite', code: 'PIN-PROC', amount: 120000, tax: 18, desc: 'Real-time facial verification, gaze tracking and browser lockdown.' },
            { name: 'Adaptive Learning Analytics Engine', code: 'PIN-ANLT', amount: 95000, tax: 18, desc: 'Personalized student intervention triggers and mastery assessment dashboard.' }
        ]
    },
    {
        code: 'STARLIGHT',
        name: 'Starlight Digital Media',
        description: 'Omnichannel Performance Marketing, Influencer Management and Creative Studio Production.',
        industry: 'Other',
        plan: 'Pro',
        email: 'hello@starlightmedia.com',
        phone: '+1-310-555-0108',
        website: 'https://starlightmedia.com',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        logo: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '9000 Sunset Boulevard, Suite 700',
            city: 'West Hollywood',
            state: 'CA',
            zipCode: '90069',
            country: 'USA'
        },
        services: [
            { name: 'Paid Social Performance Campaign', code: 'STL-ADS', amount: 6500, tax: 9, desc: 'Multi-touch attribution ad campaigns across Meta, TikTok, YouTube and LinkedIn.' },
            { name: 'Brand Identity & Design System', code: 'STL-BRD', amount: 8200, tax: 9, desc: 'Complete brand guidelines, typography, component library and digital UI kit.' },
            { name: 'Influencer Talent Management', code: 'STL-INF', amount: 5400, tax: 9, desc: 'Curated roster of 200+ tier-1 creators for targeted brand product launches.' },
            { name: 'High-Conversion Video Production', code: 'STL-VID', amount: 7000, tax: 9, desc: 'Cinematic commercial spots, motion graphics and vertical UGC content.' }
        ]
    },
    {
        code: 'CYBER',
        name: 'CyberShield InfoSec Corp',
        description: 'Zero-Trust Architecture, SOC-as-a-Service, Red Team Penetration Testing & Threat Hunting.',
        industry: 'IT',
        plan: 'Enterprise',
        email: 'security@cybershieldcorp.com',
        phone: '+1-202-555-0109',
        website: 'https://cybershieldcorp.com',
        currency: 'USD',
        timezone: 'America/New_York',
        logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '1700 Pennsylvania Avenue NW, Suite 600',
            city: 'Washington',
            state: 'DC',
            zipCode: '20006',
            country: 'USA'
        },
        services: [
            { name: 'Zero-Trust Network Implementation', code: 'CYB-ZT', amount: 13500, tax: 6, desc: 'Identity-centric network perimeter defense with micro-segmentation.' },
            { name: 'Managed SOC 24/7 SIEM Monitoring', code: 'CYB-SOC', amount: 7500, tax: 6, desc: 'Continuous endpoint detection and automated incident containment.' },
            { name: 'Red Team Penetration Testing', code: 'CYB-PEN', amount: 9800, tax: 6, desc: 'Adversary emulation, social engineering and web application exploitation.' },
            { name: 'SOC 2 & ISO 27001 Certification Prep', code: 'CYB-COMP', amount: 6000, tax: 6, desc: 'Full gap analysis, policy documentation and readiness assurance.' }
        ]
    },
    {
        code: 'AERO',
        name: 'AeroDynamics Aerospace Corp',
        description: 'Advanced Avionics, Drone Telemetry Systems and Precision Aerospace Components.',
        industry: 'Other',
        plan: 'Enterprise',
        email: 'contracts@aerodynamics.com',
        phone: '+1-206-555-0110',
        website: 'https://aerodynamics.com',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        logo: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=128&h=128&fit=crop&crop=faces',
        address: {
            street: '7755 E Marginal Way S',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98108',
            country: 'USA'
        },
        services: [
            { name: 'UAV Autonomous Flight Avionics', code: 'AER-UAV', amount: 16500, tax: 10, desc: 'Obstacle avoidance, redundant flight controllers and long-range RF telemetry.' },
            { name: 'Composite Airframe Stress Testing', code: 'AER-COMP', amount: 11500, tax: 10, desc: 'Finite element analysis (FEA) and dynamic thermal stress chamber testing.' },
            { name: 'Satellite Communications Transponder', code: 'AER-SAT', amount: 19500, tax: 10, desc: 'Ka-band miniaturized phased array antennas for LEO satellite constellations.' },
            { name: 'FAA Part 107 Fleet Certification Support', code: 'AER-FAA', amount: 4800, tax: 10, desc: 'Airworthiness certification filing and pilot training operating manuals.' }
        ]
    }
];

// Reusable Name Pools for Leads and Users
const humanNames = [
    { first: 'Alexander', last: 'Wright', gender: 'male' },
    { first: 'Elena', last: 'Rostova', gender: 'female' },
    { first: 'Marcus', last: 'Chen', gender: 'male' },
    { first: 'Sophia', last: 'Patel', gender: 'female' },
    { first: 'Liam', last: 'O\'Connor', gender: 'male' },
    { first: 'Isabella', last: 'Santos', gender: 'female' },
    { first: 'David', last: 'Kim', gender: 'male' },
    { first: 'Olivia', last: 'Taylor', gender: 'female' },
    { first: 'Ethan', last: 'Brooks', gender: 'male' },
    { first: 'Maya', last: 'Al-Mansoor', gender: 'female' },
    { first: 'Noah', last: 'Schneider', gender: 'male' },
    { first: 'Chloe', last: 'Dubois', gender: 'female' },
    { first: 'Benjamin', last: 'Hayes', gender: 'male' },
    { first: 'Amara', last: 'Okafor', gender: 'female' },
    { first: 'Lucas', last: 'Moretti', gender: 'male' },
    { first: 'Hannah', last: 'Johansson', gender: 'female' },
    { first: 'Gabriel', last: 'Silva', gender: 'male' },
    { first: 'Zoe', last: 'Kowalski', gender: 'female' },
    { first: 'Daniel', last: 'Vanderbilt', gender: 'male' },
    { first: 'Aria', last: 'Takahashi', gender: 'female' },
    { first: 'Julian', last: 'Sterling', gender: 'male' },
    { first: 'Natalie', last: 'Morales', gender: 'female' },
    { first: 'Ryan', last: 'Fitzgerald', gender: 'male' },
    { first: 'Emma', last: 'Lindqvist', gender: 'female' },
    { first: 'Caleb', last: 'Foster', gender: 'male' },
    { first: 'Ava', last: 'Reynolds', gender: 'female' },
    { first: 'Samuel', last: 'Khatri', gender: 'male' },
    { first: 'Leila', last: 'Haddad', gender: 'female' },
    { first: 'Oliver', last: 'Sinclair', gender: 'male' },
    { first: 'Mia', last: 'Bergstrom', gender: 'female' }
];

const clientCompanySuffixes = ['Corp', 'Inc', 'Solutions', 'Holdings', 'Ventures', 'Labs', 'Global', 'Enterprises', 'Group', 'Logistics'];
const clientCompanyRoots = ['Vertex', 'Omni', 'Catalyst', 'Aura', 'Summit', 'Strata', 'Kinetic', 'Echo', 'Prism', 'Beacon', 'Atlas', 'Nova', 'Pulse', 'Frontier', 'Synergy'];
const designations = ['Chief Technology Officer', 'VP of Engineering', 'Director of Operations', 'Head of Procurement', 'Managing Director', 'Chief Executive Officer', 'VP of Marketing', 'Head of Supply Chain', 'VP of Finance', 'Senior Product Manager'];

// Seed Function
async function seedTenOrganizations() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully!');

        // Check if legacy company indexes exist and clean them up to prevent null collisions
        const db = mongoose.connection.db;
        for (const collName of ['contacts', 'leads', 'services', 'billings']) {
            try {
                const indexes = await db.collection(collName).indexes();
                for (const idx of indexes) {
                    if (idx.name.startsWith('company_1_')) {
                        console.log(`Dropping legacy index ${idx.name} from ${collName}...`);
                        await db.collection(collName).dropIndex(idx.name);
                    }
                }
            } catch (err) {
                console.log(`Index cleanup notice for ${collName}:`, err.message);
            }
        }

        // Fetch Global Permissions for creating customized Organization Roles
        const allPermissions = await Permission.find();
        const permissionMap = {};
        allPermissions.forEach(p => {
            permissionMap[p.permissionName] = p._id;
        });

        // Fetch Global Organization Admin Role
        const globalOrgAdminRole = await Role.findOne({ roleName: 'Organization Admin' });
        const globalUserRole = await Role.findOne({ roleName: 'User' });

        const hashedPassword = await bcrypt.hash('Password123!', 10);

        console.log('\n======================================================');
        console.log('BEGINNING SEEDING PROCESS FOR 10 ORGANIZATIONS');
        console.log('Default Password for all users will be: Password123!');
        console.log('======================================================\n');

        let totalOrgs = 0;
        let totalUsers = 0;
        let totalRoles = 0;
        let totalCategories = 0;
        let totalServices = 0;
        let totalReferrers = 0;
        let totalLeads = 0;
        let totalFollowUps = 0;
        let totalActivities = 0;
        let totalContacts = 0;
        let totalBillings = 0;
        let totalExpenses = 0;

        for (let orgIdx = 0; orgIdx < organizationDefinitions.length; orgIdx++) {
            const orgDef = organizationDefinitions[orgIdx];
            const orgNumber = orgIdx + 1;
            console.log(`\n------------------------------------------------------`);
            console.log(`[${orgNumber}/10] Processing Organization: ${orgDef.name} (${orgDef.code})`);
            console.log(`------------------------------------------------------`);

            // Check if organization already exists with this name, if so clean previous generated data for idempotence
            let existingOrg = await Organization.findOne({ name: orgDef.name });
            if (existingOrg) {
                console.log(`Organization "${orgDef.name}" exists. Cleaning previously generated children...`);
                await Lead.deleteMany({ organization: existingOrg._id });
                await FollowUp.deleteMany({ organization: existingOrg._id });
                await Activity.deleteMany({ organization: existingOrg._id });
                await Contact.deleteMany({ organization: existingOrg._id });
                await Billing.deleteMany({ organization: existingOrg._id });
                await Expense.deleteMany({ organization: existingOrg._id });
                await Referrer.deleteMany({ organization: existingOrg._id });
                await Service.deleteMany({ organization: existingOrg._id });
                await LeadCategory.deleteMany({ organization: existingOrg._id });
                await Role.deleteMany({ organization: existingOrg._id });
                await User.deleteMany({ organization: existingOrg._id });
                await Organization.deleteOne({ _id: existingOrg._id });
                console.log(`Cleaned previous data for ${orgDef.name}.`);
            }

            // 1. Create Organization Placeholder ID
            const orgId = new mongoose.Types.ObjectId();

            // 2. Create Roles for this Organization
            // A. Admin Role
            const orgAdminRole = await Role.create({
                roleName: 'Organization Admin',
                permissions: globalOrgAdminRole ? globalOrgAdminRole.permissions : Object.values(permissionMap),
                organization: orgId,
                scope: 'organization',
                isSystemRole: false,
                accessibleByOrganizationAdmin: true,
                description: `Full administrative control for ${orgDef.name}`
            });

            // B. Sales Manager Role
            const managerPermKeys = [
                'LEAD_READ', 'LEAD_CREATE', 'LEAD_UPDATE', 'LEAD_DELETE',
                'CONTACT_READ', 'CONTACT_CREATE', 'CONTACT_UPDATE', 'CONTACT_DELETE',
                'FOLLOWUP_READ', 'FOLLOWUP_CREATE', 'FOLLOWUP_UPDATE', 'FOLLOWUP_DELETE',
                'ACTIVITY_READ', 'ACTIVITY_CREATE', 'ACTIVITY_UPDATE', 'ACTIVITY_DELETE',
                'REFERRER_READ', 'REFERRER_CREATE', 'REFERRER_UPDATE',
                'SERVICE_READ', 'BILLING_READ', 'BILLING_CREATE', 'BILLING_UPDATE',
                'REPORT_READ', 'DASHBOARD_READ', 'EXPENSE_READ', 'EXPENSE_CREATE'
            ];
            const managerPermIds = managerPermKeys.map(k => permissionMap[k]).filter(Boolean);
            const salesManagerRole = await Role.create({
                roleName: 'Sales Manager',
                permissions: managerPermIds,
                organization: orgId,
                scope: 'organization',
                isSystemRole: false,
                accessibleByOrganizationAdmin: true,
                description: `Manages sales team, leads, conversions and pipelines for ${orgDef.name}`
            });

            // C. Sales Representative Role
            const salesRepPermKeys = [
                'LEAD_READ', 'LEAD_CREATE', 'LEAD_UPDATE',
                'CONTACT_READ', 'CONTACT_CREATE', 'CONTACT_UPDATE',
                'FOLLOWUP_READ', 'FOLLOWUP_CREATE', 'FOLLOWUP_UPDATE',
                'ACTIVITY_READ', 'ACTIVITY_CREATE', 'ACTIVITY_UPDATE',
                'REFERRER_READ', 'SERVICE_READ', 'DASHBOARD_READ', 'EXPENSE_READ', 'EXPENSE_CREATE'
            ];
            const salesRepPermIds = salesRepPermKeys.map(k => permissionMap[k]).filter(Boolean);
            const salesRepRole = await Role.create({
                roleName: 'Sales Representative',
                permissions: salesRepPermIds,
                organization: orgId,
                scope: 'organization',
                isSystemRole: false,
                accessibleByOrganizationAdmin: true,
                description: `Handles lead qualification, outbound calling, meetings and follow-ups`
            });

            // D. Support Specialist Role
            const supportPermKeys = [
                'CONTACT_READ', 'CONTACT_CREATE', 'CONTACT_UPDATE',
                'ACTIVITY_READ', 'ACTIVITY_CREATE', 'ACTIVITY_UPDATE',
                'FOLLOWUP_READ', 'FOLLOWUP_CREATE', 'FOLLOWUP_UPDATE',
                'DASHBOARD_READ'
            ];
            const supportPermIds = supportPermKeys.map(k => permissionMap[k]).filter(Boolean);
            const supportRole = await Role.create({
                roleName: 'Support Specialist',
                permissions: supportPermIds,
                organization: orgId,
                scope: 'organization',
                isSystemRole: false,
                accessibleByOrganizationAdmin: true,
                description: `Customer success, account maintenance and client support`
            });

            totalRoles += 4;

            // 3. Create Users for this Organization
            const users = [];
            const domain = orgDef.email.split('@')[1];

            // A. Owner / Admin User
            const adminUserDoc = new User({
                name: `${orgDef.code} Executive Admin`,
                email: `admin@${domain}`,
                password: hashedPassword,
                role: orgAdminRole._id,
                organization: orgId,
                isActive: true
            });
            // Bypass pre-save hashing since hashedPassword is already bcrypt hashed
            await User.collection.insertOne(adminUserDoc.toObject());
            const ownerUser = await User.findById(adminUserDoc._id);
            users.push(ownerUser);

            // B. Sales Manager
            const managerName = `${getRandomElement(humanNames).first} ${getRandomElement(humanNames).last}`;
            const managerDoc = new User({
                name: managerName,
                email: `manager@${domain}`,
                password: hashedPassword,
                role: salesManagerRole._id,
                organization: orgId,
                isActive: true
            });
            await User.collection.insertOne(managerDoc.toObject());
            users.push(await User.findById(managerDoc._id));

            // C. 3 Sales Representatives
            for (let s = 1; s <= 3; s++) {
                const repName = `${getRandomElement(humanNames).first} ${getRandomElement(humanNames).last}`;
                const repDoc = new User({
                    name: repName,
                    email: `sales${s}@${domain}`,
                    password: hashedPassword,
                    role: salesRepRole._id,
                    organization: orgId,
                    isActive: true
                });
                await User.collection.insertOne(repDoc.toObject());
                users.push(await User.findById(repDoc._id));
            }

            // D. 1 Support Specialist
            const supportName = `${getRandomElement(humanNames).first} ${getRandomElement(humanNames).last}`;
            const supportDoc = new User({
                name: supportName,
                email: `support@${domain}`,
                password: hashedPassword,
                role: supportRole._id,
                organization: orgId,
                isActive: true
            });
            await User.collection.insertOne(supportDoc.toObject());
            users.push(await User.findById(supportDoc._id));

            totalUsers += users.length;

            // 4. Create Organization with owner reference
            const organization = await Organization.create({
                _id: orgId,
                name: orgDef.name,
                description: orgDef.description,
                owner: ownerUser._id,
                plan: orgDef.plan,
                isActive: true,
                settings: {
                    currency: orgDef.currency,
                    timezone: orgDef.timezone,
                    logo: orgDef.logo
                },
                phone: orgDef.phone,
                email: orgDef.email,
                website: orgDef.website,
                address: orgDef.address
            });
            totalOrgs++;
            console.log(`Created Organization: ${organization.name} (Owner: ${ownerUser.email})`);

            // 5. Create Lead Categories
            const categoryData = [
                { name: 'Enterprise Key Account', color: '#6366F1' },
                { name: 'Mid-Market Growth', color: '#0EA5E9' },
                { name: 'SMB Inbound', color: '#10B981' },
                { name: 'Strategic Partner', color: '#F59E0B' },
                { name: 'High-Intent Trial', color: '#EC4899' }
            ];
            const categories = [];
            for (const cat of categoryData) {
                const createdCat = await LeadCategory.create({
                    name: cat.name,
                    color: cat.color,
                    organization: orgId,
                    isDeleted: false
                });
                categories.push(createdCat);
            }
            totalCategories += categories.length;

            // 6. Create Services
            const services = [];
            for (let sIdx = 0; sIdx < orgDef.services.length; sIdx++) {
                const s = orgDef.services[sIdx];
                const serviceDoc = await Service.create({
                    serviceId: `SER-${orgDef.code}-${String(sIdx + 1).padStart(3, '0')}`,
                    serviceName: s.name,
                    serviceCode: `${s.code}-${orgDef.code}`,
                    industryType: orgDef.industry,
                    baseAmount: s.amount,
                    taxPercentage: s.tax,
                    description: s.desc,
                    organization: orgId,
                    createdBy: ownerUser._id,
                    isActive: true,
                    isDeleted: false
                });
                services.push(serviceDoc);
            }
            totalServices += services.length;

            // 7. Create Referrers (Unique Phone Number per referrer globally)
            const referrers = [];
            const referrerCount = 4;
            for (let r = 1; r <= referrerCount; r++) {
                const refPerson = getRandomElement(humanNames);
                const refName = `${refPerson.first} ${refPerson.last}`;
                const refPhone = `+1-8${String(orgNumber).padStart(2, '0')}${r}-555-${String(getRandomInt(1000, 9999))}`;
                const cleanRefFirst = refPerson.first.toLowerCase().replace(/[^a-z0-9]/g, '');
                const referrerDoc = await Referrer.create({
                    name: refName,
                    phone: refPhone,
                    email: `partner.${cleanRefFirst}.${orgNumber}@${domain}`,
                    organizationName: `${getRandomElement(clientCompanyRoots)} Partner Group LLC`,
                    designation: getRandomElement(['Managing Partner', 'Senior Business Broker', 'Strategic Consultant', 'Channel Director']),
                    organization: orgId,
                    createdBy: ownerUser._id,
                    isActive: true,
                    isDeleted: false
                });
                referrers.push(referrerDoc);
            }
            totalReferrers += referrers.length;

            // 8. Create Leads (30 to 40 Leads per organization)
            const leadsCount = getRandomInt(32, 38);
            const leadDocs = [];
            const salesReps = users.filter(u => u.role.toString() === salesRepRole._id.toString() || u.role.toString() === salesManagerRole._id.toString());
            const leadStatuses = ['New', 'Pending', 'In Progress', 'On Hold', 'Completed', 'Lost', 'Converted'];
            const leadSources = ['Website', 'Referral', 'WhatsApp', 'Cold Call', 'Event', 'Other'];

            for (let l = 1; l <= leadsCount; l++) {
                const leadPerson = getRandomElement(humanNames);
                const leadFullName = `${leadPerson.first} ${leadPerson.last}`;
                // Guaranteed unique phone number per organization and globally
                const leadPhone = `+1-${String(900 + orgNumber)}-${String(100 + l)}-${String(getRandomInt(1000, 9999))}`;
                const cleanLeadFirst = leadPerson.first.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanLeadLast = leadPerson.last.toLowerCase().replace(/[^a-z0-9]/g, '');
                const leadEmail = `${cleanLeadFirst}.${cleanLeadLast}.${orgDef.code.toLowerCase()}${l}@gmail.com`;
                const companyName = `${getRandomElement(clientCompanyRoots)} ${getRandomElement(clientCompanySuffixes)}`;
                const assignedRep = getRandomElement(salesReps);
                const chosenCategory = getRandomElement(categories);
                const chosenService = getRandomElement(services);

                // Distribute statuses realistically
                let status = 'New';
                const randStatus = Math.random();
                if (randStatus < 0.15) status = 'New';
                else if (randStatus < 0.30) status = 'Pending';
                else if (randStatus < 0.55) status = 'In Progress';
                else if (randStatus < 0.70) status = 'On Hold';
                else if (randStatus < 0.82) status = 'Lost';
                else status = 'Converted';

                // Source distribution
                const isReferral = Math.random() < 0.25;
                const source = isReferral ? 'Referral' : getRandomElement(leadSources);
                const referredBy = isReferral ? getRandomElement(referrers)._id : undefined;

                const createdAt = getRandomDate(new Date(Date.now() - 180 * 86400000), new Date());
                const updatedAt = new Date(createdAt.getTime() + getRandomInt(1, 30) * 86400000);
                const isConverted = status === 'Converted';
                const convertedAt = isConverted ? new Date(createdAt.getTime() + getRandomInt(5, 45) * 86400000) : undefined;
                const lostAt = status === 'Lost' ? new Date(createdAt.getTime() + getRandomInt(5, 30) * 86400000) : undefined;

                const dealValue = chosenService.baseAmount * getRandomInt(1, 4);

                leadDocs.push({
                    name: leadFullName.toUpperCase(),
                    phone: leadPhone,
                    email: leadEmail,
                    organizationName: companyName,
                    designation: getRandomElement(designations),
                    website: `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    source: source,
                    referredBy: referredBy,
                    sourceDetails: isReferral ? 'Referred via strategic channel partner' : `${source} campaign`,
                    category: chosenCategory._id,
                    status: status,
                    priority: getRandomElement(['Low', 'Medium', 'High']),
                    leadTemperature: isConverted ? 'Hot' : status === 'Lost' ? 'Cold' : getRandomElement(['Hot', 'Warm', 'Cold']),
                    isActive: true,
                    lostReason: status === 'Lost' ? getRandomElement(['Budget constraints', 'Went with legacy vendor', 'Project postponed to next fiscal year', 'Feature requirement mismatch']) : undefined,
                    nextFollowUpDate: status !== 'Converted' && status !== 'Lost' ? new Date(Date.now() + getRandomInt(1, 14) * 86400000) : undefined,
                    followUpMode: getRandomElement(['Call', 'WhatsApp', 'Email', 'Meeting']),
                    followUpCount: getRandomInt(1, 6),
                    budgetRange: `$${dealValue - 1000} - $${dealValue + 5000}`,
                    interestedProduct: chosenService.serviceName,
                    dealValue: dealValue,
                    preferredContactMode: getRandomElement(['Call', 'WhatsApp', 'Email']),
                    tags: [chosenCategory.name, orgDef.industry],
                    lastContactedAt: getRandomDate(createdAt, new Date()),
                    isConverted: isConverted,
                    convertedAt: convertedAt,
                    lostAt: lostAt,
                    organization: orgId,
                    assignedTo: assignedRep._id,
                    createdBy: ownerUser._id,
                    createdAt: createdAt,
                    updatedAt: updatedAt
                });
            }

            const createdLeads = await Lead.insertMany(leadDocs);
            totalLeads += createdLeads.length;

            // 9. Create Follow-ups, Activities, Contacts, Billings
            const followUpDocs = [];
            const activityDocs = [];
            const contactDocs = [];
            const expenseDocs = [];

            for (const lead of createdLeads) {
                // A. Follow-up for active/pending leads
                if (lead.status !== 'Converted' && lead.status !== 'Lost') {
                    // 1 Scheduled Future FollowUp
                    followUpDocs.push({
                        lead: lead._id,
                        scheduledAt: lead.nextFollowUpDate || new Date(Date.now() + getRandomInt(1, 10) * 86400000),
                        type: getRandomElement(['Call', 'Email', 'Meeting', 'WhatsApp', 'Task']),
                        status: 'Pending',
                        notes: `Scheduled ${lead.interestedProduct} discovery follow-up with ${lead.name}`,
                        outcome: 'Pending scheduled session',
                        assignedTo: lead.assignedTo,
                        createdBy: lead.assignedTo,
                        organization: orgId,
                        createdAt: lead.createdAt
                    });

                    // 1 Past Completed FollowUp
                    followUpDocs.push({
                        lead: lead._id,
                        scheduledAt: getRandomDate(lead.createdAt, new Date()),
                        type: 'Call',
                        status: 'Completed',
                        notes: `Introductory outreach call regarding ${lead.interestedProduct}`,
                        outcome: 'Client interested, requested technical quotation and timeline breakdown',
                        assignedTo: lead.assignedTo,
                        createdBy: lead.assignedTo,
                        organization: orgId,
                        createdAt: lead.createdAt
                    });
                }

                // B. Activities (Calls, Meetings, Emails, Notes)
                const activityCount = getRandomInt(1, 3);
                for (let a = 0; a < activityCount; a++) {
                    const actType = getRandomElement(['Call', 'Meeting', 'Email', 'Note']);
                    const actDate = getRandomDate(lead.createdAt, new Date());
                    activityDocs.push({
                        relatedTo: 'Lead',
                        relatedId: lead._id,
                        relatedName: lead.name,
                        activityType: actType,
                        title: `${actType}: ${lead.interestedProduct} Discussion with ${lead.name}`,
                        description: `Discussed scope requirements for ${lead.organizationName}. Outlined implementation phases and preliminary commercial terms.`,
                        notes: 'Key stakeholder was receptive and aligned with milestone deliverables.',
                        activityDate: actDate,
                        status: 'Completed',
                        priority: lead.priority === 'High' ? 'High' : 'Medium',
                        outcome: getRandomElement(['Positive', 'Follow-up Required', 'Neutral']),
                        tags: [lead.interestedProduct, 'Sales Pipeline'],
                        category: 'Sales',
                        createdBy: lead.assignedTo.toString(),
                        organization: orgId,
                        createdAt: actDate
                    });
                }

                // C. Converted Leads -> Create Contact
                if (lead.isConverted) {
                    const contactDoc = {
                        leadId: lead._id,
                        organization: orgId,
                        convertedFrom: 'Lead',
                        name: lead.name,
                        phone: lead.phone,
                        email: lead.email,
                        organizationName: lead.organizationName,
                        designation: lead.designation,
                        website: lead.website,
                        tags: ['Client'],
                        relationshipType: 'Business',
                        referredBy: lead.referredBy,
                        category: lead.category,
                        address: {
                            street: `${getRandomInt(100, 9999)} Commerce Parkway`,
                            city: orgDef.address.city,
                            state: orgDef.address.state,
                            country: orgDef.address.country,
                            zipCode: orgDef.address.zipCode
                        },
                        industry: orgDef.industry,
                        organizationSize: getRandomElement(['11-50', '51-200', '201-500']),
                        annualRevenue: '$2M - $10M',
                        lastInteractionDate: getRandomDate(lead.convertedAt || lead.createdAt, new Date()),
                        lastInteractionType: 'Meeting',
                        interactionCount: getRandomInt(4, 12),
                        preferredContactMode: lead.preferredContactMode || 'Email',
                        notes: `Converted customer from ${lead.source} campaign. Closed value: $${lead.dealValue}.`,
                        status: 'Active',
                        createdBy: lead.assignedTo,
                        createdAt: lead.convertedAt || lead.createdAt,
                        updatedAt: new Date()
                    };
                    contactDocs.push(contactDoc);
                }
            }

            // Insert FollowUps & Activities
            if (followUpDocs.length > 0) {
                const createdFollowUps = await FollowUp.insertMany(followUpDocs);
                totalFollowUps += createdFollowUps.length;
            }

            if (activityDocs.length > 0) {
                const createdActivities = await Activity.insertMany(activityDocs);
                totalActivities += createdActivities.length;
            }

            // Insert Contacts and corresponding Billings
            if (contactDocs.length > 0) {
                const createdContacts = await Contact.insertMany(contactDocs);
                totalContacts += createdContacts.length;

                const billingDocs = [];
                for (let bIdx = 0; bIdx < createdContacts.length; bIdx++) {
                    const contact = createdContacts[bIdx];
                    const chosenService = getRandomElement(services);
                    const qty = getRandomInt(1, 3);
                    const subtotal = chosenService.baseAmount * qty;
                    const taxRate = (chosenService.taxPercentage || 10) / 100;
                    const taxTotal = Math.round(subtotal * taxRate);
                    const grandTotal = subtotal + taxTotal;
                    const invoiceNumber = `INV-${orgDef.code}-${String(1001 + bIdx)}`;
                    const billingId = `BILL-${orgDef.code}-${String(bIdx + 1).padStart(4, '0')}`;
                    const billingDate = getRandomDate(contact.createdAt, new Date());
                    const dueDate = new Date(billingDate.getTime() + 30 * 86400000);

                    billingDocs.push({
                        billingId: billingId,
                        contact: contact._id,
                        organization: orgId,
                        invoiceNumber: invoiceNumber,
                        services: [{
                            serviceId: chosenService._id,
                            serviceName: chosenService.serviceName,
                            quantity: qty,
                            unitAmount: chosenService.baseAmount,
                            taxAmount: taxTotal,
                            totalAmount: grandTotal
                        }],
                        subtotal: subtotal,
                        taxTotal: taxTotal,
                        discount: 0,
                        grandTotal: grandTotal,
                        paymentStatus: getRandomElement(['PAID', 'PAID', 'PENDING', 'OVERDUE']),
                        paymentMode: getRandomElement(['BANK', 'CARD', 'UPI']),
                        billingDate: billingDate,
                        dueDate: dueDate,
                        notes: `Professional invoice for ${chosenService.serviceName} delivered to ${contact.organizationName}.`,
                        createdBy: contact.createdBy,
                        createdAt: billingDate
                    });
                }

                if (billingDocs.length > 0) {
                    const createdBillings = await Billing.insertMany(billingDocs);
                    totalBillings += createdBillings.length;
                }
            }

            // 10. Create Expenses for each User in this Organization
            const expenseCategories = ['Travel', 'Food', 'Office', 'Software', 'Marketing'];
            for (const user of users) {
                const expenseCount = getRandomInt(2, 4);
                for (let e = 0; e < expenseCount; e++) {
                    const cat = getRandomElement(expenseCategories);
                    let expTitle = '';
                    let expAmount = 0;
                    if (cat === 'Travel') {
                        expTitle = 'Flight & Hotel for Client Onsite Demo';
                        expAmount = getRandomInt(250, 1200);
                    } else if (cat === 'Food') {
                        expTitle = 'Business Dinner with Client Stakeholders';
                        expAmount = getRandomInt(60, 320);
                    } else if (cat === 'Software') {
                        expTitle = 'Monthly SaaS API & Cloud Hosting Seat';
                        expAmount = getRandomInt(45, 450);
                    } else if (cat === 'Marketing') {
                        expTitle = 'LinkedIn Sponsored Ad Campaign Budget';
                        expAmount = getRandomInt(300, 1500);
                    } else {
                        expTitle = 'Office Supplies & Hardware Peripheral';
                        expAmount = getRandomInt(30, 200);
                    }

                    expenseDocs.push({
                        organization: orgId,
                        title: expTitle,
                        amount: expAmount,
                        category: cat,
                        expenseDate: getRandomDate(new Date(Date.now() - 90 * 86400000), new Date()),
                        description: `Operational expense logged by ${user.name} for ${orgDef.name}`,
                        createdBy: user._id
                    });
                }
            }

            if (expenseDocs.length > 0) {
                const createdExpenses = await Expense.insertMany(expenseDocs);
                totalExpenses += createdExpenses.length;
            }

            // 11. Initial Audit Log
            await AuditLog.create({
                user: ownerUser._id,
                organization: orgId,
                action: 'CREATE',
                entity: 'Organization',
                entityId: orgId,
                details: `Organization ${orgDef.name} initialized with complete roles, users, services and pipelines.`,
                createdAt: new Date()
            });

            console.log(`✓ Completed ${orgDef.name}: ${createdLeads.length} leads, ${followUpDocs.length} follow-ups, ${activityDocs.length} activities, ${contactDocs.length} contacts, ${expenseDocs.length} expenses.`);
        }

        console.log('\n======================================================');
        console.log('SEEDING COMPLETED SUCCESSFULLY!');
        console.log('======================================================');
        console.log(`- Organizations Created: ${totalOrgs}`);
        console.log(`- Roles Created:         ${totalRoles}`);
        console.log(`- Users Created:         ${totalUsers}`);
        console.log(`- Categories Created:    ${totalCategories}`);
        console.log(`- Services Created:      ${totalServices}`);
        console.log(`- Referrers Created:     ${totalReferrers}`);
        console.log(`- Leads Created:         ${totalLeads}`);
        console.log(`- FollowUps Created:     ${totalFollowUps}`);
        console.log(`- Activities Created:    ${totalActivities}`);
        console.log(`- Contacts Created:      ${totalContacts}`);
        console.log(`- Billings Created:      ${totalBillings}`);
        console.log(`- Expenses Created:      ${totalExpenses}`);
        console.log('======================================================');
        console.log('All users created have password: Password123!');
        console.log('You can switch organizations using the top navbar dropdown or log in directly.');
        console.log('======================================================\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('SEEDING FAILED WITH ERROR:', error);
        process.exit(1);
    }
}

seedTenOrganizations();
