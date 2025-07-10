// mailer.js
const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like 'SendGrid' or 'Mailgun'
  auth: {
    user: 'your-email@gmail.com', // Replace with your Gmail address
    pass: 'your-email-password',  // Replace with your Gmail password or App password if 2FA is enabled
  },
});

// Function to send email
const sendEmail = (toEmail, subject, text) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: toEmail,
    subject: subject,
    text: text,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ Error sending email:', error);
    } else {
      console.log('✅ Email sent: ' + info.response);
    }
  });
};

module.exports = sendEmail;
