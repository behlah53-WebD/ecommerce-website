const nodemailer = require("nodemailer");


const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS


const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 15000,
});


transporter.verify((err) => {
  if (err) {
    console.error("[Mailer] Transporter verification failed:", err.message);
  } else {
    console.log("[Mailer] Transporter ready");
  }
});


async function sendEmail({ to, subject, html, text, from }) {
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials are not configured");
  }


  const fromName = process.env.SMTP_FROM_NAME || "App";
  const fromAddress =
    from ||
    `"${fromName}" <${smtpUser}>`;


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