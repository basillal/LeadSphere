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

module.exports = {
    login,
    logout,
    refresh,
    getMe
};
