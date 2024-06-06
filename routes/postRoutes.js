const router = require('express').Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { verifyToken } = require('../middleware/verifyToken');
const { createPost, getAllPosts,getPostById,updatePostById,deletePostById,getPostsByType} = require('../controller/postController');

router.post("/create", isAuthenticatedUser, createPost);
router.get("/getallposts",verifyToken, getAllPosts);
router.get("/getPostsbytype/:type",verifyToken, getPostsByType);
router.get("/getpost/:id", getPostById);
router.get("/update", isAuthenticatedUser, updatePostById);
router.get("/delete", isAuthenticatedUser, deletePostById);
module.exports = router;