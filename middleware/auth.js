const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

async function isAuthenticatedUser(req, res, next) {
    try {
        // Extract the token from the 'Authorization' header
        const { token } = req.headers;


        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify the token
        const decoded_data = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user and exclude sensitive fields
        const user = await User.findById(decoded_data.id).select('-password -otp -otpExpiration -otpTime');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Attach the user object to the request
        req.user = user;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle invalid or expired token
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please log in again.' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token. Access denied.' });
        } else {
            // Generic error message
            console.error('Authentication error:', error);
            return res.status(500).json({ message: 'An error occurred during authentication.', error: error.message });
        }
    }
}

module.exports = { isAuthenticatedUser };
