const router = require('express').Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { updateUser, getUser,getAllUsers,getUserById } = require('../controller/userController');

router.put("/", isAuthenticatedUser, updateUser);
router.get("/", isAuthenticatedUser, getUser);
router.get("/getalluser", getAllUsers);
router.get("/:id", getUserById);

module.exports = router;