const User = require('../models/User');
const Role = require('../models/Role');
const { logAudit } = require('../utils/auditLogger');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email })
        .populate({
            path: 'role',
            populate: { path: 'permissions' }
        })
        .populate('organization');

    if (user && (await user.matchPassword(password))) {
        if (!user.isActive) {
            // Log failed login attempt (Inactive) - careful not to expose too much if user doesn't exist, but here we found user.
            // However, req.user is not set yet. We need to manually construct context or improve logAudit helper.
            // For now, let's log successes mainly, or critical failures if user known.
            res.status(401);
            throw new Error('User is inactive');
        }

        if (user.organization && !user.organization.isActive) {
            res.status(401);
            throw new Error('Organization is inactive. Please contact support.');
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Send Refresh Token in HttpOnly Cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Lax is better for SPA navigation
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Manually inject user into req for audit log since middleware hasn't run yet
        req.user = user; 
        await logAudit(req, 'LOGIN', 'Auth', user._id, `User logged in from ${req.ip || 'unknown IP'}`);

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization,
            accessToken
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Logout user / Clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
    // Attempt to log logout if user context available (might not be if token expired, but frontend sends it usually)
    // Actually logout is often called without valid auth header if token expired? 
    // If protect middleware is used on logout route, we have req.user.
    // Check routes/authRoutes.js to see if logout is protected. It usually isn't strict.
    // If not protected, we can't reliable log WHO logged out.
    // Assuming we might have user from previous middleware or partial auth?
    // Let's just try logging if req.user exists.
    
    if(req.user) {
        await logAudit(req, 'LOGOUT', 'Auth', req.user._id, 'User logged out');
    }

    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out' });
});

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public (Validation via Cookie)
const refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401);
        throw new Error('Not authorized, no refresh token');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret123');
        const user = await User.findById(decoded.id)
            .populate('role')
            .populate('organization');

        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate({
            path: 'role',
            populate: { path: 'permissions' }
        })
        .populate('organization');

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization
    });
});

// @desc    Register a new Organization and Admin User
// @route   POST /api/auth/register-organization
// @access  Public
const registerOrganization = asyncHandler(async (req, res) => {
    const { organizationName, adminName, email, password } = req.body;

    if (!organizationName || !adminName || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // Check if organization exists (optional, maybe allow duplicates? usually not)
    // For now, let's enforce unique organization names for simplicity or check if needed.
    // Schema doesn't enforce unique name, but let's check.
    const Organization = require('../models/Organization');
    const organizationExists = await Organization.findOne({ name: organizationName });
    if (organizationExists) {
        res.status(400);
        throw new Error('Organization with this name already exists');
    }

    // Find "Organization Admin" Role
    // Assuming "Organization Admin" is a global role with name "Organization Admin"
    // In seedAuth.js it is created.
    let organizationAdminRole = await Role.findOne({ roleName: 'Organization Admin' });
    
    if (!organizationAdminRole) {
        res.status(500);
        throw new Error('System Error: Organization Admin role not found');
    }

    // 1. Create Organization (Owner is required, so we might need to create User first, but User needs Organization?)
    // User needs Organization (ref) -> Organization needs Owner (ref, required).
    // Solution: Create User with dummy organization or no organization first (if User schema allows null organization, which it does as it's just a ref, not required in Schema definition I saw earlier).
    // Wait, User Schema: organization: { type: ObjectId, ref: 'Organization' } - not marked required.
    // Organization Schema: owner: { type: ObjectId, ref: 'User', required: true }

    // So:
    // A. Create User (no organization initially).
    // B. Create Organization (owner = user._id).
    // C. Update User (organization = organization._id).

    // Create User
    const user = await User.create({
        name: adminName,
        email,
        password,
        role: organizationAdminRole._id,
        // organization: null // initially
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid user data');
    }

    // Create Organization
    const organization = await Organization.create({
        name: organizationName,
        owner: user._id,
        plan: 'Free', // Default plan
        isActive: true
    });

    if (!organization) {
        // Cleanup if organization creation fails
        await User.findByIdAndDelete(user._id);
        res.status(400);
        throw new Error('Invalid organization data');
    }

    // Update User with Organization
    user.organization = organization._id;
    await user.save();

    // Log Audit
    // req.user is not set by middleware here, so manual context needed or skip
    // await logAudit(req, 'CREATE', 'Organization', organization._id, `Organization registered: ${organizationName}`);

    // Generate Token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        accessToken
    });
});

module.exports = {
    login,
    registerOrganization, // Export new function
    logout,
    refresh,
    getMe
};
