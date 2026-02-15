const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        logger.info('MongoDB already connected');
        return;
    }
    
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('MongoDB Connected...');
    } catch (err) {
        logger.error('Database connection failed: %s', err.message);
        throw err; // Throw error so calling function can handle it
    }
};

module.exports = connectDB;