const express = require('express'); // Restart trigger
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

// Connect to Database
// Connect to Database
// connectDB(); // Removed for serverless compatibility



// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser or same-origin requests
        if (!origin) {
            return callback(null, true);
        }

        // In non-production, allow all origins to avoid LAN/mobile dev CORS issues
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Important for cookies
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies


// Routes
const errorHandler = require('./middleware/errorHandler');

// Routes
const leadRoutes = require('./routes/leadRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const contactRoutes = require('./routes/contactRoutes');
const activityRoutes = require('./routes/activityRoutes');
const referrerRoutes = require('./routes/referrerRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/referrers', referrerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/billings', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('Node.js Server is Running');
});

app.use(errorHandler);

// Start Server
const logger = require('./utils/logger');

// Start Server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, async () => {
        await connectDB();
        logger.info(`Server running on port ${PORT}`);
    });
}

module.exports = app;