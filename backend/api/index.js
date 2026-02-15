const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
        app(req, res);
    } catch (error) {
        console.error('Vercel Function Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
