// routes/likeRoutes.js
const express = require('express');
const { toggleLike,getLikeStatus } = require('../controller/likeController');
const { isAuthenticatedUser } = require('../middleware/auth');
const router = express.Router();

router.post('/post/:postId/like', isAuthenticatedUser, toggleLike);
router.get('/post/:postId/likeStatus', isAuthenticatedUser, getLikeStatus);
module.exports = router;
