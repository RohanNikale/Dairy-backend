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
            text: `Your OTP for signing up on Ambitious is: ${otp}. Do not share this code with anyone.`, // plain text body
        };

        // Send mail with defined transport object
        await transporter.sendMail(message);

        return;
    } catch (error) {
        throw error;
    }
}

module.exports = { sendOtp };
