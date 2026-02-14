const express = require('express'); // Restart trigger
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();

// Connect to Database
connectDB();


// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port, adjust if needed for cookies to work
    credentials: true // Important for cookies
}));
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
const companyRoutes = require('./routes/companyRoutes');
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
app.use('/api/companies', companyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes); // Added dashboard route
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

// Error Handler Middleware (Should be last)
app.use(errorHandler);

// Start Server
const logger = require('./utils/logger');

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});