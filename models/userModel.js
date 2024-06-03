const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        username:{
            type: String,
            unique: true,
        },
        email: {
            type: String,
        },
        adminAccess: {
            type: Boolean,
        },
        profilePic: {
            type: String,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        phoneno: {
            type: String,
        },
        password: {
            type: String,
        },
        emailVerified: { type: Boolean, default: false },
        otp: {
            type: String,
        },
        otpExpiration: {
            type: Date,
        },

        otpTime: {
            type: Date,
        },
    },
    { timestamps: true }
);

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

const user = mongoose.model("user", userSchema);

module.exports = user;