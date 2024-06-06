const Post = require('../models/postModel');
const Like = require('../models/likeModel');
const sanitize = require('sanitize-html'); // For input sanitization

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
    try {
        const userId = req.params.userId; // Extract user ID from params
        const username = req.user.username; // Extract username from middleware (if needed)
        const sanitizedContent = sanitizeInput(req.body.content); // Sanitize the post content
        const sanitizedTitle = sanitizeInput(req.body.title); // Sanitize the title
        const sanitizedType = sanitizeInput(req.body.type); // Sanitize the type

        const post = new Post({
            ...req.body,
            content: sanitizedContent,
            title: sanitizedTitle,
            type: sanitizedType,
            userId,
            author: req.user.name,
            username,
            likes: [] // Initialize likes as an empty array
        });

        await post.save();
        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user ? req.user._id : null;

        const posts = await Post.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const totalPosts = await Post.countDocuments();

        const postList = await Promise.all(posts.map(async post => {
            const postObj = post.toObject();
            if (userId) {
                const like = await Like.findOne({ postId: post._id, userId:userId });
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
            totalPages: Math.ceil(totalPosts / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

// Get posts by type with pagination
exports.getPostsByType = async (req, res) => {
    try {
        const { type } = req.params; // Extract user ID from params
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user ? req.user._id : null;

        const sanitizedType = sanitizeInput(type);
        const skip = (page - 1) * limit;
        const posts = await Post.find({ type: sanitizedType })
            .skip(skip)
            .limit(parseInt(limit));
        const totalPosts = await Post.countDocuments({ type: sanitizedType });

        const hasMore = (skip + posts.length) < totalPosts;

        if (posts.length === 0) {
            return res.status(404).json({ status: false, message: 'No posts found for this type' });
        }

        const postList = await Promise.all(posts.map(async post => {
            const postObj = post.toObject();
            if (userId) {
                const like = await Like.findOne({ postId: post._id, userId:userId });
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

// Get a single post by ID with like status
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.params.userId; // Extract user ID from params
        const liked = userId ? post.likes.some(like => like.userId.toString() === userId) : false;

        res.status(200).json({ message: 'Post fetched successfully', post, liked });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

// Update a post by ID
exports.updatePostById = async (req, res) => {
    try {
        const userId = req.params.userId; // Extract user ID from params
        const postId = req.params.id;
        const sanitizedContent = sanitizeInput(req.body.content);
        const sanitizedTitle = sanitizeInput(req.body.title);
        const sanitizedType = sanitizeInput(req.body.type);

        const post = await Post.findOneAndUpdate(
            { _id: postId, userId },
            { ...req.body, content: sanitizedContent, title: sanitizedTitle, type: sanitizedType },
            { new: true, runValidators: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized update' });
        }

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

// Delete a post by ID
exports.deletePostById = async (req, res) => {
    try {
        const userId = req.params.userId; // Extract user ID from params
        const postId = req.params.id;

        const post = await Post.findOneAndDelete({ _id: postId, userId });

        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized delete' });
        }

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};
