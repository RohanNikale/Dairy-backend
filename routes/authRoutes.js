const router = require('express').Router();

const { signUp, verifyEmail, login,checkUsername } = require("../controller/authController.js");

router.post("/send-otp", signUp);
router.post("/verify-otp", verifyEmail);
router.post("/login", login);
router.post('/check-username', checkUsername);
module.exports = router;