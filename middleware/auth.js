const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

async function isAuthenticatedUser(req, res, next) {
    const { token } = req.headers;

    if (!token) {
        return res.status(500).send("Please log in to view this resource.");
    }

    try {
        const decoded_data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded_data.id).select('-password -otp -otpExpiration -otpTime');

        return next();
    }
    catch (error) {
        res.status(500).json({
            message: error,
        });
    }   
}

module.exports = { isAuthenticatedUser };