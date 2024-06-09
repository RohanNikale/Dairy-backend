// controllers/commentController.js

const Comment = require('../models/commentModel');
const Reply = require('../models/replyModel');
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

// Create a comment
exports.createComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const sanitizedContent = sanitizeInput(req.body.content);
        const comment = new Comment({
            postId: req.body.postId,
            content: sanitizedContent,
            userId
        });
        await comment.save();
        res.status(201).json({ message: 'Comment created successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Error creating comment', error: error.message });
    }
};

// Get comments with pagination
exports.getComments = async (req, res) => {
    try {
        const { postId, page = 1, limit = 10 } = req.query;

        const comments = await Comment.find({ postId })
            .sort({ createdAt: -1 }) // Sort in descending order by createdAt timestamp
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('userId', 'name username'); // Populate user information for the comment

        res.status(200).json({ message: 'Comments fetched successfully', comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

// Update a comment
exports.updateComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const commentId = req.params.id;
        const sanitizedContent = sanitizeInput(req.body.content);

        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, userId },
            { content: sanitizedContent },
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found or unauthorized update' });
        }

        res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating comment', error: error.message });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const commentId = req.params.id;

        const comment = await Comment.findOne({ _id: commentId, userId });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found or unauthorized delete' });
        }

        await comment.deleteOne();
        await Reply.deleteMany({commentId}) // Trigger the pre-remove hook to delete associated replies

        res.status(200).json({ message: 'Comment and its replies deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

// Create a reply to a comment
exports.createReply = async (req, res) => {
    try {
        const userId = req.user.id;
        const commentId = req.params.commentId;
        const sanitizedContent = sanitizeInput(req.body.content);

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const reply = new Reply({
            commentId,
            content: sanitizedContent,
            userId
        });
        await reply.save();

        res.status(201).json({ message: 'Reply added successfully', reply });
    } catch (error) {
        res.status(500).json({ message: 'Error creating reply', error: error.message });
    }
};

// Get replies with pagination
exports.getReplies = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const replies = await Reply.find({ commentId })
            .sort({ createdAt: -1 }) // Sort in descending order by createdAt timestamp
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('userId', 'name username'); // Populate user information for the reply

        const totalReplies = await Reply.countDocuments({ commentId });
        const hasMore = (page * limit) < totalReplies;

        res.status(200).json({ message: 'Replies fetched successfully', replies, hasMore });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching replies', error: error.message });
    }
};

// Update a reply
exports.updateReply = async (req, res) => {
    try {
        const userId = req.user.id;
        const replyId = req.params.replyId;
        const sanitizedContent = sanitizeInput(req.body.content);

        const reply = await Reply.findOneAndUpdate(
            { _id: replyId, userId },
            { content: sanitizedContent },
            { new: true, runValidators: true }
        );

        if (!reply) {
            return res.status(404).json({ message: 'Reply not found or unauthorized update' });
        }

        res.status(200).json({ message: 'Reply updated successfully', reply });
    } catch (error) {
        res.status(500).json({ message: 'Error updating reply', error: error.message });
    }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
    try {
        const userId = req.user.id;
        const replyId = req.params.replyId;

        const reply = await Reply.findOneAndDelete({ _id: replyId, userId });

        if (!reply) {
            return res.status(404).json({ message: 'Reply not found or unauthorized delete' });
        }

        res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reply', error: error.message });
    }
};
