const router = require('express').Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { verifyToken } = require('../middleware/verifyToken');
const { 
    createPost, 
    getAllPosts, 
    getPostById, 
    updatePostById, 
    deletePostById, 
    getPostsByType, 
    getPostsByUserId, 
    getRecommendedPosts 
} = require('../controller/postController');

// Create a post
router.post("/create", isAuthenticatedUser, createPost);

// Get all posts
router.get("/getallposts", isAuthenticatedUser, getAllPosts);

// Get posts by user ID
router.get("/user/:userId", isAuthenticatedUser, getPostsByUserId);

// Get posts by type
router.get("/getPostsbytype/:type", isAuthenticatedUser, getPostsByType);

// Get recommended posts
router.get("/recommended", verifyToken, getRecommendedPosts);

// Get a specific post by ID
router.get("/getpost/:id", isAuthenticatedUser, getPostById);

// Update a post by ID
router.put("/update/:id", isAuthenticatedUser, updatePostById);

// Delete a post by ID
router.delete("/:id", isAuthenticatedUser, deletePostById);

module.exports = router;
