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
const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password'); // Exclude password field from the response
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
const toggleFollow = async (req, res) => {
    const { userIdToFollow } = req.params; // The ID of the user to follow/unfollow
    const userId = req.user.id; // The ID of the current logged-in user
    const { name, username } = req.user;
  
    try {
      // Find the user to follow/unfollow
      const userToFollow = await User.findById(userIdToFollow);
      if (!userToFollow) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user is trying to follow/unfollow themselves
      if (userId === userIdToFollow) {
        return res.status(400).json({ message: 'You cannot follow/unfollow yourself' });
      }
  
      // Find the logged-in user
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: 'Current user not found' });
      }
  
      // Check if the current user already follows the user
      const followIndex = userToFollow.followers.findIndex(follower => follower.userId.toString() === userId);
  
      if (followIndex > -1) {
        // Unfollow the user
        userToFollow.followers.splice(followIndex, 1);
        const followingIndex = currentUser.following.findIndex(following => following.userId.toString() === userIdToFollow);
        if (followingIndex > -1) {
          currentUser.following.splice(followingIndex, 1);
        }
      } else {
        // Follow the user
        userToFollow.followers.push({ userId, name, username });
        currentUser.following.push({ userId: userIdToFollow, name: userToFollow.name, username: userToFollow.username });
      }
  
      // Save the updated user documents
      await userToFollow.save();
      await currentUser.save();
  
      // Send a response indicating the action performed
      res.json({ message: followIndex > -1 ? 'User unfollowed' : 'User followed' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
module.exports = { updateUser, getUser,toggleFollow,getAllUsers };
