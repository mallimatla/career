const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email
 * @param {object} options - Email options
 */
exports.sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'ClarityVid AI <noreply@clarityvid.ai>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email Error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

/**
 * Send video completion notification
 */
exports.sendVideoCompletionEmail = async (user, video) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Your Video is Ready!</h1>
      <p>Hi ${user.firstName},</p>
      <p>Great news! Your video "${video.title}" has been successfully generated.</p>
      <p><a href="${process.env.FRONTEND_URL}/videos/${video.id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Video</a></p>
      <p>Video details:</p>
      <ul>
        <li>Duration: ${Math.floor(video.duration / 60)} minutes ${video.duration % 60} seconds</li>
        <li>Resolution: ${video.resolution}</li>
        <li>Format: ${video.format}</li>
      </ul>
      <p>Thank you for using ClarityVid AI!</p>
    </div>
  `;

  await exports.sendEmail({
    to: user.email,
    subject: 'Your Video is Ready - ClarityVid AI',
    html,
  });
};
