const User = require('../models/userModel');
const Follow = require('../models/followModel');
const { hash } = require('../utils/hash');

async function updateUser(req, res) {
    try {
        const { name,username, email, bio, gender } = req.body;
        let { password } = req.body;

        if (password) {
            password = await hash(password);
        }

        const updatedData = {};
        if (name) updatedData.name = name;
        if (username) updatedData.username = username;
        if (email) updatedData.email = email;
        if (gender) updatedData.gender = gender;
        if (bio) updatedData.bio = bio;

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
        let user = req.user;

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

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -email'); // Exclude password field from the response
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateInterests = async (req, res) => {
    try {
        const userId = req.user._id;
        const { interests } = req.body;

        if (!Array.isArray(interests)) {
            return res.status(400).json({ message: 'Interests should be an array of strings' });
        }

        const user = await User.findByIdAndUpdate(userId, { interests }, { new: true });

        res.status(200).json({ message: 'Interests updated successfully', interests: user.interests });
    } catch (error) {
        res.status(500).json({ message: 'Error updating interests', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        let followed = false; // Initialize followed as false by default
        const userId = req.user ? req.user._id : null;

        // Check if the user is logged in and if they are following the requested user
        if (userId) {
            const follow = await Follow.findOne({ follower: userId, following: req.params.id });
            followed = !!follow; // Set followed to true if follow document exists, otherwise false
        }

        const user = await User.findById(req.params.id).select('-password -email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Count the number of followers and following
        const followersCount = await Follow.countDocuments({ following: req.params.id });
        const followingCount = await Follow.countDocuments({ follower: req.params.id });

        res.status(200).json({ user, followed, followersCount, followingCount }); // Return user data, followed status, and follower/following counts
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const searchUserProfiles = async (req, res) => {
    try {
        const { query } = req.query; // Get the search query from the request

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const userId = req.user ? req.user._id : null;
        const users = await User.find({
            _id: { $ne: userId }, // Exclude the current user from the search results
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('-password -email -otp -gender'); // Exclude password field from the response

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully.",
            users,
        });
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({
            success: false,
            message: "Error while searching users.",
        });
    }
};

module.exports = { updateUser, getUser, getAllUsers, getUserById, updateInterests, searchUserProfiles };
