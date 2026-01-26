const User = require('../models/User');
const Role = require('../models/Role');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).populate({
        path: 'role',
        populate: { path: 'permissions' }
    });

    if (user && (await user.matchPassword(password))) {
        if (!user.isActive) {
            res.status(401);
            throw new Error('User is inactive');
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

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
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
        const user = await User.findById(decoded.id).populate('role');

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
    const user = await User.findById(req.user.id).populate({
        path: 'role',
        populate: { path: 'permissions' }
    });

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    });
});

module.exports = {
    login,
    logout,
    refresh,
    getMe
};
