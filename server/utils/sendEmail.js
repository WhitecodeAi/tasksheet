const nodemailer = require('nodemailer');
require('dotenv').config(); // Load env variables

const sendEmailToUser = async ({ name, email, password }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
       logger: true,
        debug: true
    });
console.log('Email:', process.env.EMAIL_USER);
console.log('Password:', process.env.EMAIL_PASS.length); // Just length, not the actual password

    const mailOptions = {
      from: `"WhiteCode Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🛠️ Your WhiteCode Tasksheet Account Details',
      html: `
        <h2>Welcome aboard, ${name}!</h2>
        <p>Your account has been successfully created.</p>
        <p><strong>Login Credentials:</strong></p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p><a href="http://localhost:3000/login" style="color: blue;">Click here to log in</a></p>
        <br/>
        <p style="font-size: 0.9em;">If you have any issues, reach out to the support team.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
  }
};

module.exports = sendEmailToUser;
