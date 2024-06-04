const router = require('express').Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { updateUser, getUser,getAllUsers,toggleFollow } = require('../controller/userController');

router.put("/", isAuthenticatedUser, updateUser);
router.get("/", isAuthenticatedUser, getUser);
router.get("/getalluser", getAllUsers);
router.post("/:userIdToFollow/follow", isAuthenticatedUser, toggleFollow);

module.exports = router;