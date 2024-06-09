const express = require('express');
const { followToggle, getFollowers, getFollowing, profilestofollow } = require('../controller/followController');
const { isAuthenticatedUser } = require('../middleware/auth'); // Ensure this path is correct
const { verifyToken } = require('../middleware/verifyToken'); // Ensure this path is correct
const router = express.Router();

router.post('/:id/follow', isAuthenticatedUser, followToggle);
router.get('/:id/followers', verifyToken, getFollowers);
router.get('/:id/following', verifyToken, getFollowing);
router.get('/profiles-to-follow', verifyToken, profilestofollow); // Added profiles-to-follow endpoint
module.exports = router;
