const User = require('../models/userModel');
const { hash } = require('../utils/hash');

async function updateUser(req, res) {
    try {
        const { name, email, profilePic, gender } = req.body;
        let { password } = req.body;

        if (password) {
            password = await hash(password);
        }

        const updatedData = {};
        if (name) updatedData.name = name;
        if (email) updatedData.email = email;
        if (profilePic) updatedData.profilePic = profilePic;
        if (gender) updatedData.gender = gender;

        const user = await User.findByIdAndUpdate(req.user.id, updatedData).select('-password -otp -otpExpiration -otpTime');

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            user,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            success: false,
            message: "Error while updating user.",
        });
    }
}

async function getUser(req, res) {
    try {
        
        let user =req.user;

        return res.status(200).json({
            success: true,
            message: "Successfully retrieved user data.",
            user,
        });
    } catch (error) {
        console.error("Error getting user info:", error);
        return res.status(500).json({
            success: false,
            message: "Error while getting user info.",
        });
    }
}

module.exports = { updateUser, getUser };