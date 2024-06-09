const Follow = require('../models/followModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
exports.followToggle = async (req, res) => {
  const userId = req.user.id;
  const followId = req.params.id;

  // Check if the user is trying to follow themselves
  if (userId === followId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
      const existingFollow = await Follow.findOne({ follower: userId, following: followId });

      if (existingFollow) {
          await Follow.deleteOne({ _id: existingFollow._id });
          await Notification.deleteOne({user:followId,fromUser:userId,type:"new_follower"})
          res.json({ message: 'User unfollowed' });
      } else { 
          const follow = new Follow({ follower: userId, following: followId });
          await follow.save();

          // Create a new notification for the followed user
          const followedUser = await User.findById(followId).select('name');
          const newNotification = new Notification({
              user: followId,
              fromUser: userId, // Include the follower's user ID
              type: 'new_follower',
              message: `started following you.`
          });
          await newNotification.save();

          res.json({ message: 'User followed' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Internal server error', error });
  }
};
exports.getFollowers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: req.params.id })
      .skip(skip)
      .limit(limit)
      .populate('follower', 'id name username'); // Select only id, name, username

    let followed = [];
    if (req.user) {
      const followingIds = await Follow.find({ follower: req.user.id }).select('following');
      followed = followers.map(follower => ({
        ...follower.follower.toObject(), // Use follower's populated object
        followed: followingIds.some(f => f.following.equals(follower.follower._id))
      }));
    } else {
      followed = followers.map(follower => ({
        ...follower.follower.toObject(), // Use follower's populated object
        followed: false
      }));
    }

    const totalFollowers = await Follow.countDocuments({ following: req.params.id });
    const hasMore = totalFollowers > (page * limit);

    res.status(200).json({
      profiles: followed,
      currentPage: page,
      totalPages: Math.ceil(totalFollowers / limit),
      hasMore
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: req.params.id })
      .skip(skip)
      .limit(limit)
      .populate('following', 'id name username'); // Select only id, name, username

    let followed = [];
    if (req.user) {
      const followingIds = await Follow.find({ follower: req.user.id }).select('following');
      followed = following.map(follow => ({
        ...follow.following.toObject(), // Use following's populated object
        followed: followingIds.some(f => f.following.equals(follow.following._id))
      }));
    } else {
      followed = following.map(follow => ({
        ...follow.following.toObject(), // Use following's populated object
        followed: false
      }));
    }

    const totalFollowing = await Follow.countDocuments({ follower: req.params.id });
    const hasMore = totalFollowing > (page * limit);

    res.status(200).json({
      profiles: followed,
      currentPage: page,
      totalPages: Math.ceil(totalFollowing / limit),
      hasMore
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.profilestofollow = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch users excluding the current user if it exists
    const query = req.user ? { _id: { $ne: req.user.id } } : {};
    const users = await User.find(query)
      .select('id name username') // Select only id, name, username
      .skip(skip)
      .limit(limit);
    
    let followingIds = [];
    if (req.user) {
      const followings = await Follow.find({ follower: req.user.id }).select('following');
      followingIds = followings.map(follow => follow.following.toString());
    }

    const profiles = users.map(user => ({
      id: user._id,
      displayName: user.name,
      username: user.username,
      picColor: getRandomColor(), // Generate a random color or use profilePic if you have an image URL
      followed: req.user ? followingIds.includes(user._id.toString()) : false
    }));

    res.json({
      profiles,
      currentPage: page,
      totalPages: Math.ceil(await User.countDocuments(query) / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

function getRandomColor() {
  const colors = ['pink', 'palegoldenrod', 'powderblue'];
  return colors[Math.floor(Math.random() * colors.length)];
}
