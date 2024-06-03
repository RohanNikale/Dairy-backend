const Post = require('../models/postModel');
const sanitize = require('sanitize-html'); // For input sanitization

// Sanitization function
const sanitizeInput = (input) => {
    return sanitize(input, {
        allowedTags: false, 
        disallowedTagsMode: 'discard',
        disallowedTags: ['script','style'], 
        allowedAttributes: false, 
    });
};

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from middleware
        const username = req.user.username; // Extract username from middleware
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
            username
        }); // Include userId

        await post.save();
        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};


exports.toggleLike = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    const { name, username } = req.user;
  
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Check if the user already liked the post
      const likeIndex = post.likes.findIndex(like => like.userId.toString() === userId);
  
      if (likeIndex > -1) {
        // Unlike the post
        post.likes.splice(likeIndex, 1);
      } else {
        // Like the post
        post.likes.push({ userId, name, username });
      }
  
      await post.save();
  
      res.json({ message: likeIndex > -1 ? 'Post unliked' : 'Post liked' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
exports.getLikesCount=async(req, res)=> {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }

        const likesCount = post.likes.length;

        return res.status(200).json({
            likesCount
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error while fetching likes count",
            success: false
        });
    }
}


// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Extract page and limit from query parameters
        const posts = await Post.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const totalPosts = await Post.countDocuments();

        res.status(200).json({
            message: 'Posts fetched successfully',
            posts,
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
        const { type } = req.params; // Extract type from URL parameters
        const { page = 1, limit = 10 } = req.query; // Extract page and limit from query parameters
        const sanitizedType = sanitizeInput(type); // Sanitize the type input

        const posts = await Post.find({ type: sanitizedType })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        const totalPosts = await Post.countDocuments({ type: sanitizedType });

        if (posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this type' });
        }
        res.status(200).json({
            message: 'Posts fetched successfully',
            posts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts by type', error: error.message });
    }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post fetched successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

// Update a post by ID
exports.updatePostById = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        const sanitizedContent = sanitizeInput(req.body.content); // Sanitize the post content
        const sanitizedTitle = sanitizeInput(req.body.title); // Sanitize the title
        const sanitizedType = sanitizeInput(req.body.type); // Sanitize the type

        const post = await Post.findOneAndUpdate(
            { _id: postId, userId }, // Match post ID and user ID
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
        const userId = req.user.id;
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
