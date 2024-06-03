const router = require('express').Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { createPost, getAllPosts,getPostById,updatePostById,deletePostById,getPostsByType ,toggleLike} = require('../controller/postController');

router.post("/create", isAuthenticatedUser, createPost);
router.get("/getallposts", getAllPosts);
router.get("/getPostsbytype/:type", getPostsByType);
router.get("/getpost/:id", getPostById);
router.get("/update", isAuthenticatedUser, updatePostById);
router.get("/delete", isAuthenticatedUser, deletePostById);
router.post('/:postId/like', isAuthenticatedUser, toggleLike);
module.exports = router;