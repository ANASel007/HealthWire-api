// Import dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Initialize database
const db = require('./config/db');

// Initialize Express app
const app = express();

// Enhanced CORS configuration
const corsOptions = {
    origin: '*', // In production, you'd list specific domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Accept', 'x-auth-token']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Request logging for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Doctor Appointment API' });
});

// Error handling middleware with more details
app.use((err, req, res, next) => {
    console.error(`Error processing ${req.method} ${req.path}:`, err.stack);

    // Send appropriate error response
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'An error occurred on the server',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API accessible at http://localhost:${PORT}/api`);
});

// Handle unexpected errors
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});