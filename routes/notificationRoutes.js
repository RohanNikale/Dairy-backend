const express = require('express');
const {  getNotifications, markAsRead } = require('../controller/Notification');
const { isAuthenticatedUser } = require('../middleware/auth'); // Assuming you have an auth middleware

const router = express.Router();

router.get('/', isAuthenticatedUser, getNotifications); // Get notifications for the authenticated user
router.patch('/:id/read', isAuthenticatedUser, markAsRead); // Mark a notification as read

module.exports = router;
