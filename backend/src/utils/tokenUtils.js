const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user._id
        },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || 'refreshSecret123',
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};
