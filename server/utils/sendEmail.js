const nodemailer = require('nodemailer');
require('dotenv').config(); // Load env variables

const sendEmailToUser = async ({ name, email, password }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'whitecode.dev@gmail.com',
        pass: 'bmldwegxkvojznud'
      },
       logger: true,
        debug: true
    });
 
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
        <p><a href="https://tasksheet.whitecodetech.com/login" style="color: blue;">Click here to log in</a></p>
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
