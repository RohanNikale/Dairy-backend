const User = require("../models/userModel");
const { sendOtp } = require("../utils/sendOtp");
const { generateOtp } = require("../utils/generateOtp");
const { genToken } = require("../utils/jwtToken");
const { hash, compareHash } = require('../utils/hash');

// Define OTP expiration duration globally
const otpExpirationDuration = 2 * 60 * 1000;

async function signUp(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw Error("Please provide an email address and password");
        }

        // Check if the email already exists
        let user = await User.findOne({ email });

        if (user) {
            throw Error("Email already exists, please log in instead");
        }

        // Generate OTP for email verification
        const otp = generateOtp();
        const hashedOtp = await hash(otp);

        // Save user with email, hashed password, and OTP details
        user = await User.create({
            email,
            password: await hash(password),
            otp: hashedOtp,
            otpExpiration: Date.now() + otpExpirationDuration
        });

        // Send OTP to the user's email
        await sendOtp(otp, email);

        return res.status(200).json({
            message: "Signup successful. A 5 digit OTP has been sent to your email address for verification.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error while signing up",
            success: false
        });
    }
}

async function verifyEmail(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Please provide a valid email address and OTP",
                success: false
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found with provided email address",
                success: false
            });
        }

        const otpIsValid = await compareHash(String(otp), user.otp);

        if (!otpIsValid || user.otpExpiration < Date.now()) {
            return res.status(400).json({
                message: "The OTP you provided is invalid, used, or expired",
                success: false
            });
        }

        // Clear OTP fields after successful verification
        user.otp = "";
        user.otpExpiration = "";
        await user.save();

        return res.status(200).json({
            message: "Email verification successful",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error while verifying email",
            success: false
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw Error("Please provide an email address and password");
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            throw Error("User not found with provided email address");
        }

        // Check if password is correct
        const validPassword = await compareHash(password, user.password);

        if (!validPassword) {
            throw Error("Incorrect password");
        }

        // Generate JWT token for authentication
        const token = genToken(user);

        return res.status(200).json({
            message: "Login successful",
            success: true,
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Authentication failed",
            success: false
        });
    }
}

module.exports = { signUp, verifyEmail, login };
