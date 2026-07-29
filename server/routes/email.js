

const express = require('express');
const { sendEmail } = require('../utils/mailer');

const router = express.Router();

/**
 * @swagger
 * /email/send:
 *   post:
 *     summary: Send an email via SMTP
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, subject]
 *             properties:
 *               to:
 *                 type: string
 *                 example: recipient@example.com
 *               subject:
 *                 type: string
 *                 example: Hello from the app!
 *               html:
 *                 type: string
 *                 example: <h1>Hello</h1>
 *               text:
 *                 type: string
 *                 example: Hello
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/send', async (req, res) => {
  const { to, subject, html, text } = req.body;

  // ── Basic validation ──────────────────────────────────────
  if (!to) {
    return res.status(400).json({ success: false, message: '"to" (recipient) is required' });
  }
  if (!subject) {
    return res.status(400).json({ success: false, message: '"subject" is required' });
  }
  if (!html && !text) {
    return res.status(400).json({ success: false, message: 'Either "html" or "text" body is required' });
  }

  // ── Send email ────────────────────────────────────────────
  try {
    const info = await sendEmail({ to, subject, html, text });
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('[Email Route] Error sending email:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
});

module.exports = router;
