const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

async function verifyToken(req, res, next) {
    const token = req.headers['token']// Extract token from 'Authorization' header
    if (!token || !token == undefined) {
        return next(); // If no token, proceed to next middleware
    }

    try {
        const decoded_data = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = await User.findById(decoded_data.id).select('-password -otp -otpExpiration -otpTime -name -username'); // Fetch user data without sensitive fields
        next(); // Proceed to next middleware
    } catch (error) {
        res.status(401).json({
            message: 'Invalid token or token has expired', // Provide a more specific error message
        });
    }
}

module.exports = { verifyToken };
