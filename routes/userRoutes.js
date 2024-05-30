const router = require('express').Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { updateUser, getUser } = require('../controller/userController');

router.put("/", isAuthenticatedUser, updateUser);
router.get("/", isAuthenticatedUser, getUser);

module.exports = router;