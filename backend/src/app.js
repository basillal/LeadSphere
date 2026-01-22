const express = require('express');
const cors = require('cors');
require('dotenv').config();


const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const app = express();

// Connect to Database
connectDB();


// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies


// Routes
const errorHandler = require('./middleware/errorHandler');

// Routes
app.use('/api/users', userRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('Node.js Server is Running');
});

// Error Handler Middleware (Should be last)
app.use(errorHandler);

// Start Server
const logger = require('./utils/logger');

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});