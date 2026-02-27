const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log("Testing with email:", process.env.EMAIL_USER);
    // don't log password broadly, just length check to make sure it's loaded
    console.log("Password loaded:", !!process.env.EMAIL_PASS, process.env.EMAIL_PASS?.length);
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,       // Port 587 for TLS
        secure: false,   // false for 587 (it will upgrade to secure strictly via STARTTLS)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `GDG Codenation <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // send to self
            subject: 'Test Email Verification',
            text: 'If you see this, nodemailer is working correctly!',
        });
        console.log('✅ Success! Email sent.');
    } catch (error) {
        console.error('❌ Failed:', error.message);
        console.error(error);
    }
}

testEmail();
