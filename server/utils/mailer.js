
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


async function sendEmail({ to, subject, html, text, from }) {
  const fromName = process.env.SMTP_FROM_NAME || 'App';
  const fromAddress = from || `"${fromName}" <${process.env.SMTP_USER}>`;

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    ...(html ? { html } : {}),
    ...(text ? { text } : {}),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Mailer] Email sent to ${to} — MessageId: ${info.messageId}`);
  return info;
}

module.exports = { sendEmail, transporter };
