// routes/commentRoutes.js

const router = require('express').Router();
const {isAuthenticatedUser} = require('../middleware/auth'); // Ensure this path is correct
const commentController = require('../controller/commentController');

// Create a comment
router.post('/', isAuthenticatedUser, commentController.createComment);

// Get comments with pagination
router.get('/', commentController.getComments);

// Update a comment
router.put('/:id', isAuthenticatedUser, commentController.updateComment);

// Delete a comment
router.delete('/:id', isAuthenticatedUser, commentController.deleteComment);

// Create a reply to a comment
router.post('/:commentId/replies', isAuthenticatedUser, commentController.createReply);

// Get replies with pagination
router.get('/:commentId/replies', commentController.getReplies);

// Update a reply
router.put('/:commentId/replies/:replyId', isAuthenticatedUser, commentController.updateReply);

// Delete a reply
router.delete('/:commentId/replies/:replyId', isAuthenticatedUser, commentController.deleteReply);

module.exports = router;
