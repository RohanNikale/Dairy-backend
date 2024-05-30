const router = require('express').Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { createPost, getAllPosts,getPostById,updatePostById,deletePostById } = require('../controller/postController');

router.post("/create", isAuthenticatedUser, createPost);
router.get("/getallposts", getAllPosts);
router.get("/getpost/:id", getPostById);
router.get("/update", isAuthenticatedUser, updatePostById);
router.get("/delete", isAuthenticatedUser, deletePostById);

module.exports = router;