const router = require('express').Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { verifyToken } = require('../middleware/verifyToken');
const { updateUser, getUser,getAllUsers,getUserById ,updateInterests,searchUserAndPosts} = require('../controller/userController');

router.put("/", isAuthenticatedUser, updateUser);
router.get("/", isAuthenticatedUser, getUser);
router.get("/search", searchUserAndPosts);
router.get("/updateinterests", isAuthenticatedUser, updateInterests);
router.get("/getalluser", getAllUsers);
router.get("/:id",verifyToken, getUserById);

module.exports = router;