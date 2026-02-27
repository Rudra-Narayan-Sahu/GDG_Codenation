const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Strict Environment Check
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("CRITICAL: EMAIL_USER or EMAIL_PASS environment variables are missing! Email cannot be sent.");
        throw new Error("Email configuration missing on the server.");
    }

    // 2. Create a transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,       // Port 587 for TLS
        secure: false,   // false for 587 (it will upgrade to secure strictly via STARTTLS)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 3. Define the email options
    const mailOptions = {
        from: `GDG Codenation <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 4. Send the email with detailed error catching
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email}. MessageId: ${info.messageId}`);
    } catch (error) {
        console.error(`🚨 Nodemailer Error sending to ${options.email}:`, error.message);
        throw error; // Rethrow to let the controller catch it
    }
};

module.exports = sendEmail;
