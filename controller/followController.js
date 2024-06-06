const Follow = require('../models/followModel');
const User = require('../models/userModel');
exports.followToggle = async (req, res) => {
    const userId = req.user.id;
    const followId = req.params.id;

    try {
        const existingFollow = await Follow.findOne({ follower: userId, following: followId });

        if (existingFollow) {
            await Follow.deleteOne({ _id: existingFollow._id });
            res.json({ message: 'User unfollowed' });
        } else {
            const follow = new Follow({ follower: userId, following: followId });
            await follow.save();
            res.json({ message: 'User followed' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error',error });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const followers = await Follow.find({ following: req.params.id }).populate('follower');
        res.status(200).json(followers);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const following = await Follow.find({ follower: req.params.id }).populate('following');
        res.status(200).json(following);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.profilestofollow = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('id name username profilePic')
      .skip(skip)
      .limit(limit);
    
    const followings = await Follow.find({ follower: req.user.id }).select('following');
    const followingIds = followings.map(follow => follow.following.toString());

    const profiles = users.map(user => ({
      id: user._id,
      displayName: user.name,
      username: user.username,
      picColor: getRandomColor(), // Generate a random color or use profilePic if you have an image URL
      followed: followingIds.includes(user._id.toString())
    }));

    res.json({
      profiles,
      currentPage: page,
      totalPages: Math.ceil(await User.countDocuments({ _id: { $ne: req.user.id } }) / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

function getRandomColor() {
  const colors = ['pink', 'palegoldenrod', 'powderblue'];
  return colors[Math.floor(Math.random() * colors.length)];
}
