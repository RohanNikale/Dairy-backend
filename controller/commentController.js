// controllers/commentController.js

const Comment = require('../models/commentModel');
const sanitize = require('sanitize-html'); // For input sanitization

// Sanitization function
const sanitizeInput = (input) => {
    return sanitize(input, {
        allowedTags: false,
        disallowedTagsMode: 'discard',
        disallowedTags: ['script'],
        allowedAttributes: false,
    });
};

// Create a comment
exports.createComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const sanitizedContent = sanitizeInput(req.body.content);
        const comment = new Comment({
            username:req.user.username,
            name:req.user.name,
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
            .limit(parseInt(limit));

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

        const comment = await Comment.findOneAndDelete({ _id: commentId, userId });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found or unauthorized delete' });
        }

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status500().json({ message: 'Error deleting comment', error: error.message });
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

        const reply = {
            name:req.user.name,
            username:req.user.username,
            content: sanitizedContent,
            userId
        };

        comment.replies.push(reply);
        await comment.save();

        res.status(201).json({ message: 'Reply added successfully', comment });
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

        const sortedReplies = comment.replies.slice().reverse(); // Reverse the array of replies

        const replies = sortedReplies.slice((page - 1) * limit, page * limit);

        res.status(200).json({ message: 'Replies fetched successfully', replies });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching replies', error: error.message });
    }
};


// Update a reply
exports.updateReply = async (req, res) => {
    try {
        const userId = req.user.id;
        const commentId = req.params.commentId;
        const replyId = req.params.replyId;
        const sanitizedContent = sanitizeInput(req.body.content);

        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, 'replies._id': replyId, 'replies.userId': userId },
            { $set: { 'replies.$.content': sanitizedContent } },
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json({ message: 'Reply not found or unauthorized update' });
        }

        res.status(200).json({ message: 'Reply updated successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating reply', error: error.message });
    }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
    try {
        const userId = req.user.id;
        const commentId = req.params.commentId;
        const replyId = req.params.replyId;

        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, 'replies._id': replyId, 'replies.userId': userId },
            { $pull: { replies: { _id: replyId } } },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({ message: 'Reply not found or unauthorized delete' });
        }

        res.status(200).json({ message: 'Reply deleted successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reply', error: error.message });
    }
};
