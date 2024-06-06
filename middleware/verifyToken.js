const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

async function verifyToken(req, res, next) {
    const { token } = req.headers;

    if (!token) {
        return next()
    }

    try {
        const decoded_data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded_data.id).select('-password -otp -otpExpiration -otpTime -name -username');

        return next();
    }
    catch (error) {
        res.status(500).json({
            message: error,
        });
    }   
}

module.exports = { verifyToken };