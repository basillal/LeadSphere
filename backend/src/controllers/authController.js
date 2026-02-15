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
        .populate('company');

    if (user && (await user.matchPassword(password))) {
        if (!user.isActive) {
            // Log failed login attempt (Inactive) - careful not to expose too much if user doesn't exist, but here we found user.
            // However, req.user is not set yet. We need to manually construct context or improve logAudit helper.
            // For now, let's log successes mainly, or critical failures if user known.
            res.status(401);
            throw new Error('User is inactive');
        }

        if (user.company && !user.company.isActive) {
            res.status(401);
            throw new Error('Company is inactive. Please contact support.');
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
            company: user.company,
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
            .populate('company');

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
        .populate('company');

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company
    });
});

// @desc    Register a new Company and Admin User
// @route   POST /api/auth/register-company
// @access  Public
const registerCompany = asyncHandler(async (req, res) => {
    const { companyName, adminName, email, password } = req.body;

    if (!companyName || !adminName || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // Check if company exists (optional, maybe allow duplicates? usually not)
    // For now, let's enforce unique company names for simplicity or check if needed.
    // Schema doesn't enforce unique name, but let's check.
    const Company = require('../models/Company');
    const companyExists = await Company.findOne({ name: companyName });
    if (companyExists) {
        res.status(400);
        throw new Error('Company with this name already exists');
    }

    // Find "Company Admin" Role
    // Assuming "Company Admin" is a global role with name "Company Admin"
    // In seedAuth.js it is created.
    let companyAdminRole = await Role.findOne({ roleName: 'Company Admin' });
    
    if (!companyAdminRole) {
        res.status(500);
        throw new Error('System Error: Company Admin role not found');
    }

    // 1. Create Company (Owner is required, so we might need to create User first, but User needs Company?)
    // User needs Company (ref) -> Company needs Owner (ref, required).
    // Solution: Create User with dummy company or no company first (if User schema allows null company, which it does as it's just a ref, not required in Schema definition I saw earlier).
    // Wait, User Schema: company: { type: ObjectId, ref: 'Company' } - not marked required.
    // Company Schema: owner: { type: ObjectId, ref: 'User', required: true }

    // So:
    // A. Create User (no company initially).
    // B. Create Company (owner = user._id).
    // C. Update User (company = company._id).

    // Create User
    const user = await User.create({
        name: adminName,
        email,
        password,
        role: companyAdminRole._id,
        // company: null // initially
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid user data');
    }

    // Create Company
    const company = await Company.create({
        name: companyName,
        owner: user._id,
        plan: 'Free', // Default plan
        isActive: true
    });

    if (!company) {
        // Cleanup if company creation fails
        await User.findByIdAndDelete(user._id);
        res.status(400);
        throw new Error('Invalid company data');
    }

    // Update User with Company
    user.company = company._id;
    await user.save();

    // Log Audit
    // req.user is not set by middleware here, so manual context needed or skip
    // await logAudit(req, 'CREATE', 'Company', company._id, `Company registered: ${companyName}`);

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
        company: user.company,
        accessToken
    });
});

module.exports = {
    login,
    registerCompany, // Export new function
    logout,
    refresh,
    getMe
};
