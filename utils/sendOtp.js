const nodemailer = require('nodemailer');

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Function to send OTP via email
async function sendOtp(otp, recipient_email) {
    try {
        const message = {
            from: process.env.GMAIL_USER, // sender address
            to: recipient_email, // list of receivers
            subject: 'Your OTP Code', // Subject line
            text: `Your OTP for signing up on QalaamKaar is: ${otp}. Do not share this code with anyone.`, // plain text body
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                    <h2 style="text-align: center; color: #e0245e;">Welcome to QalaamKaar!</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Thank you for signing up. To complete your registration, please use the following One-Time Password (OTP) to verify your email address:</p>
                    <p style="font-size: 20px; text-align: center; font-weight: bold; color: #e0245e;">${otp}</p>
                    <p style="font-size: 16px; color: #333;">This OTP is valid for the next 2 minutes. If you did not request this, please ignore this email.</p>
                    <p style="font-size: 16px; color: #333;">Thank you,</p>
                    <p style="font-size: 16px; color: #333;">The QalaamKaar Team</p>
                </div>
            `
        };

        // Send mail with defined transport object
        await transporter.sendMail(message);

        return;
    } catch (error) {
        throw error;
    }
}

module.exports = { sendOtp };
