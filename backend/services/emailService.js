const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT == 465, 
  pool: true, // Use pooled connections
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 30000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

const emailService = {
  /**
   * Send notification to admin about new account request
   */
  async sendAdminNotification(userDetails) {
    if (!process.env.ADMIN_EMAIL) {
        console.warn('ADMIN_EMAIL not set, skipping email notification');
        return;
    }

    const mailOptions = {
      from: `"Vectarc System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Account Creation Request',
      html: `
        <h2>New Account Request</h2>
        <p>A new user has requested account creation on Vectarc platform:</p>
        <ul>
          <li><strong>Username:</strong> ${userDetails.username}</li>
          <li><strong>Email:</strong> ${userDetails.email}</li>
        </ul>
        <p>Please log in to the admin portal to approve or reject this request.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Admin notification email sent');
    } catch (error) {
      console.error('Error sending admin notification email:', error);
    }
  },

  /**
   * Send notification to user about account approval
   */
  async sendApprovalNotification(userEmail, username) {
    const mailOptions = {
      from: `"Vectarc System" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Account Approved - Vectarc',
      html: `
        <h2>Account Approved</h2>
        <p>Hello ${username},</p>
        <p>Your account on Vectarc platform has been approved by the administrator.</p>
        <p>You can now log in using your credentials.</p>
        <p><a href="${process.env.FRONTEND_URL || 'https://reflix.vectarc.com'}">Login to Vectarc</a></p>
        <br/>
        <p>Best regards,<br/>Vectarc Team</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Approval notification email sent to user');
    } catch (error) {
      console.error('Error sending approval notification email:', error);
    }
  }
};

module.exports = emailService;
