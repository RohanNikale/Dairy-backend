const router = require('express').Router();

const { signUp, verifyEmail, login, } = require("../controller/authController.js");

router.post("/send-otp", signUp);
router.post("/verify-otp", verifyEmail);
router.post("/login", login);

module.exports = router;