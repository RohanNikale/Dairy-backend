const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

async function isAuthenticatedAdmin(req, res, next) {
    const { token } = req.headers;

    if (!token) {
        throw Error("Please login to access this resource");
    }

    try {
        const decoded_data = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded_data.id);

        if (!(req.user.adminAccess)) {
            throw Error("Only Admin have access");
        }

        return next();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Login to proceed",
        });
    }
}

module.exports = { isAuthenticatedAdmin };