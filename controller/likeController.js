const Like = require('../models/likeModel');
const Post = require('../models/postModel');
const Notification = require('../models/notificationModel');

exports.toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const existingLike = await Like.findOne({ userId, postId });

        if (existingLike) {
            await existingLike.deleteOne();
            await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

            const post = await Post.findById(postId).populate('userId');
            if (post) {
                await Notification.deleteOne({ user: post.userId._id, fromUser: userId, type: "new_like" });
            }

            return res.status(200).json({ message: 'Post unliked', liked: false });
        } else {
            const newLike = new Like({ userId, postId });
            await newLike.save();
            await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

            const post = await Post.findById(postId).populate('userId');
                const newNotification = new Notification({
                    user: post.userId._id,
                    fromUser: userId,
                    postId,
                    type: 'new_like',
                    message: `Liked your post.`
                });
                await newNotification.save();

            return res.status(200).json({ message: 'Post liked', liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Error toggling like', error: error.message });
    }
};
exports.getLikeStatus = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const like = await Like.findOne({ userId, postId });
        const liked = !!like;

        res.status(200).json({ liked });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching like status', error: error.message });
    }
};