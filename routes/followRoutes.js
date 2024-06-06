const express = require('express');
const { followToggle, getFollowers, getFollowing,profilestofollow } = require('../controller/followController');
const {isAuthenticatedUser} = require('../middleware/auth'); // Ensure this path is correct
const router = express.Router();

router.post('/:id/follow', isAuthenticatedUser, followToggle);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/profiles-to-follow', isAuthenticatedUser, profilestofollow)
module.exports = router;
