const Post = require('../models/postModel');
const Like = require('../models/likeModel');
const Comment = require('../models/commentModel'); // Import the Comment model
const Reply = require('../models/replyModel'); // Import the Reply model
const sanitize = require('sanitize-html');
const Follow = require('../models/followModel');
const User = require('../models/userModel'); // Ensure to import User model

// Sanitization function
const sanitizeInput = (input) => {
    return sanitize(input, {
        allowedTags: false,
        disallowedTagsMode: 'discard',
        disallowedTags: ['script', 'style'],
        allowedAttributes: false,
    });
};

// Create a new post
exports.createPost = async (req, res) => {
    console.log(req.body)
    try {
        const userId = req.user._id;
        const sanitizedContent = sanitizeInput(req.body.content);
        const sanitizedTitle = sanitizeInput(req.body.title);
        const sanitizedType = sanitizeInput(req.body.type);
        const sanitizedTags = req.body.tags.map(tag => sanitizeInput(tag));

        const post = new Post({
            ...req.body,
            content: sanitizedContent,
            title: sanitizedTitle,
            type: sanitizedType,
            tags: sanitizedTags,
            userId,
            likes: [] // Initialize likes as an empty array
        });

        await post.save();

        // Populate the user details
        const populatedPost = await Post.findById(post._id).populate('userId', 'name username');

        res.status(201).json({ message: 'Post created successfully', post: populatedPost });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user ? req.user._id : null;

        const skip = (page - 1) * limit;
        const posts = await Post.find()
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name username'); // Populate user details

        const totalPosts = await Post.countDocuments();

        const postList = await Promise.all(posts.map(async post => {
            const postObj = post.toObject();
            if (userId) {
                const like = await Like.findOne({ postId: post._id, userId });
                postObj.liked = !!like;
            } else {
                postObj.liked = false;
            }
            return postObj;
        }));

        const hasMore = (skip + posts.length) < totalPosts;

        res.status(200).json({
            message: 'Posts fetched successfully',
            posts: postList,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / limit),
            hasMore
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

exports.getPostsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user ? req.user._id : null;

        const sanitizedType = sanitizeInput(type);
        const skip = (page - 1) * limit;
        const posts = await Post.find({ type: sanitizedType })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name username'); // Populate user details

        const totalPosts = await Post.countDocuments({ type: sanitizedType });

        const hasMore = (skip + posts.length) < totalPosts;

        if (posts.length === 0) {
            return res.status(404).json({ status: false, message: 'No posts found for this type' });
        }

        const postList = await Promise.all(posts.map(async post => {
            const postObj = post.toObject();
            if (userId) {
                const like = await Like.findOne({ postId: post._id, userId });
                postObj.liked = !!like;
            } else {
                postObj.liked = false;
            }
            return postObj;
        }));

        res.status(200).json({
            message: 'Posts fetched successfully',
            posts: postList,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / limit),
            hasMore
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts by type', error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('userId', 'name username'); // Populate user details
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const userId = req.user ? req.user._id : null;
        const likeStatus = await Like.findOne({ postId: post._id, userId });
        let liked = !!likeStatus;

        res.status(200).json({ message: 'Post fetched successfully', post, liked });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

exports.updatePostById = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;
        const sanitizedContent = sanitizeInput(req.body.content);
        const sanitizedTitle = sanitizeInput(req.body.title);
        const sanitizedType = sanitizeInput(req.body.type);
        const sanitizedTags = req.body.tags.map(tag => sanitizeInput(tag));

        const post = await Post.findOneAndUpdate(
            { _id: postId, userId },
            { ...req.body, content: sanitizedContent, title: sanitizedTitle, type: sanitizedType, tags: sanitizedTags },
            { new: true, runValidators: true }
        ).populate('userId', 'name username'); // Populate user details

        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized update' });
        }

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

exports.deletePostById = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;

        // Find the post first
        const post = await Post.findOne({ _id: postId, userId });

        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized delete' });
        }

        // Delete all likes associated with the post
        await Like.deleteMany({ postId });

        // Delete all replies associated with the comments of the post
        const comments = await Comment.find({ postId });
        for (const comment of comments) {
            await Reply.deleteMany({ commentId: comment._id });
        }

        // Delete all comments associated with the post
        await Comment.deleteMany({ postId });

        // Finally, delete the post
        await Post.deleteOne({ _id: postId, userId });

        res.status(200).json({ message: 'Post and associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};

exports.getPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;
        const posts = await Post.find({ userId })
            .sort({ createdAt: -1 }) // Sort posts in descending order by creation date
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name username'); // Populate user details

        const totalPosts = await Post.countDocuments({ userId });

        const postList = await Promise.all(posts.map(async post => {
            const postObj = post.toObject();
            if (req.user) {
                const like = await Like.findOne({ postId: post._id, userId: req.user._id });
                postObj.liked = !!like;
            } else {
                postObj.liked = false;
            }
            return postObj;
        }));

        const hasMore = (skip + posts.length) < totalPosts;

        res.status(200).json({
            message: 'Posts fetched successfully',
            posts: postList,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / limit),
            hasMore,
            totalPosts  // Include total number of posts in the response
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts by user ID', error: error.message });
    }
};



exports.getRecommendedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        const userId = req.user ? req.user._id : null;
        const sanitizedType = type ? sanitizeInput(type) : null;

        const skip = (page - 1) * limit;
        let posts = [];
        let totalPosts;

        if (userId) {
            const user = await User.findById(userId);
            const followedUsers = await Follow.find({ follower: userId }).select('following');
            const followingIds = followedUsers.map(follow => follow.following);

            // Fetch posts from followed users
            let query = { userId: { $in: followingIds } };
            if (sanitizedType) query.type = sanitizedType;

            const followingPosts = await Post.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('userId', 'name username'); // Populate user details

            const followingPostsCount = await Post.countDocuments(query);

            // Add posts from followed users to the posts array
            posts = followingPosts;

            // Fetch additional posts if there are not enough posts from followed users
            if (posts.length < limit) {
                const remainingLimit = limit - posts.length;
                const excludedPostIds = posts.map(post => post._id);

                query = { _id: { $nin: excludedPostIds } };
                if (sanitizedType) query.type = sanitizedType;

                const additionalPosts = await Post.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(remainingLimit)
                    .populate('userId', 'name username'); // Populate user details

                posts = [...posts, ...additionalPosts];
            }

            totalPosts = followingPostsCount + (await Post.countDocuments({ type: sanitizedType }));
        } else {
            // If the user is not logged in, get all posts by type
            const query = {};
            if (sanitizedType) query.type = sanitizedType;

            posts = await Post.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('userId', 'name username'); // Populate user details

            totalPosts = await Post.countDocuments(query);
        }

        const postList = await Promise.all(posts.map(async post => {
            const postObj = post.toObject();
            if (userId) {
                const like = await Like.findOne({ postId: post._id, userId });
                postObj.liked = !!like;
            } else {
                postObj.liked = false;
            }
            return postObj;
        }));

        const hasMore = (skip + posts.length) < totalPosts;

        res.status(200).json({
            message: 'Posts fetched successfully',
            posts: postList,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / limit),
            hasMore
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};
