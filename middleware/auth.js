const jwt = require('jsonwebtoken');

// Get JWT secret from environment or use a default (in production, always use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'appointment_api_secret_key';

/**
 * Middleware to authenticate JWT tokens
 */
function auth(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user from payload
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

/**
 * Middleware to check if user is a doctor
 */
function doctorAuth(req, res, next) {
    auth(req, res, () => {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied, doctor role required' });
        }
        next();
    });
}

/**
 * Middleware to check if user is a client
 */
function clientAuth(req, res, next) {
    auth(req, res, () => {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Access denied, client role required' });
        }
        next();
    });
}

module.exports = { auth, doctorAuth, clientAuth, JWT_SECRET };