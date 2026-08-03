const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { User } = require("../models/User");
const { JWT_SECRET, REFRESH_SECRET } = require("../config/jwt");

const router = express.Router();

const publicUser = (user) => {
  if (!user) return null;
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.authPassword;
  if (value.details && Array.isArray(value.details)) {
    value.details = value.details.map((d) => {
      const cleaned = { ...d };
      delete cleaned.password;
      return cleaned;
    });
  }
  return value;
};

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.authEmail, role: user.role || "Buyer", name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.authEmail, role: user.role || "Buyer", name: user.name },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

router.get("/check-admin", async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: "Admin" });
    return res.json({ success: true, adminExists: adminCount > 0 });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

const { authenticateToken } = require("../middleware/auth");

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    return res.json({ success: true, data: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    const { name, authEmail } = req.body || {};

    if (name !== undefined) {
      const trimmedName = String(name || "").trim();
      if (trimmedName === "") {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }
      user.name = trimmedName;
    }

    if (authEmail !== undefined) {
      const trimmedEmail = normalizeEmail(authEmail);
      if (!trimmedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }

      const existing = await User.findOne({ authEmail: trimmedEmail, id: { $ne: user.id } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered to another account.",
        });
      }
      user.authEmail = trimmedEmail;
    }

    await user.save();
    return res.json({
      success: true,
      message: "Profile updated successfully.",
      data: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/user", async (req, res) => {
  try {
    const email = normalizeEmail(req.query.authEmail || req.query.email);
    const id = req.query.id;
    if (!email && !id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID or email is required." });
    }

    const user = await User.findOne(email ? { authEmail: email } : { id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    return res.json({ success: true, data: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    let role = String(req.body.role || "Buyer").trim();

   
    if (role.toLowerCase() === "admin") role = "Admin";
    else if (role.toLowerCase() === "seller") role = "Seller";
    else role = "Buyer";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (role === "Admin") {
      const adminCount = await User.countDocuments({ role: "Admin" });
      if (adminCount > 0) {
        return res.status(409).json({
          success: false,
          message: "An Admin account already exists. Only one Admin account is allowed.",
        });
      }
    }

    const existingUser = await User.findOne({ authEmail: email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "This auth email/username already exists. Please use another one.",
      });
    }

    const user = await User.create({
      id: `user_${crypto.randomUUID()}`,
      authEmail: email,
      authPassword: password,
      name,
      role,
      approvalStatus: role === "Seller" ? "pending" : "approved",
      details: [],
    });

    return res.status(201).json({
      success: true,
      message:
        role === "Seller"
          ? "Seller account created successfully and sent to Admin for approval."
          : "Account created successfully!",
      data: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This auth email/username already exists. Please use another one.",
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ authEmail: email });
    if (!user || user.authPassword !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const sellerApprovalStatus = user.approvalStatus || "approved";
    if (user.role === "Seller" && sellerApprovalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Admin has not approved your seller account yet.",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      data: publicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/seller-approval-requests", authenticateToken, async (req, res) => {
  try {
    const admin = await User.findOne({ id: req.user.id });
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin accounts can access seller approval requests.",
      });
    }

    const sellers = await User.find({ role: "Seller" }).sort({ updatedAt: -1 });
    return res.json({
      success: true,
      data: sellers.map(publicUser),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/seller-approval-requests/:id/approve", authenticateToken, async (req, res) => {
  try {
    const admin = await User.findOne({ id: req.user.id });
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin accounts can approve seller accounts.",
      });
    }

    const seller = await User.findOneAndUpdate(
      { id: req.params.id, role: "Seller" },
      { $set: { approvalStatus: "approved" } },
      { returnDocument: "after" },
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller account not found.",
      });
    }

    return res.json({
      success: true,
      message: `${seller.name || "Seller"} approved successfully.`,
      data: publicUser(seller),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token is required" });
  }

  jwt.verify(refreshToken, REFRESH_SECRET, async (err, userPayload) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findOne({ id: userPayload.id });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

router.put("/change-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const id = req.body.id;
    const password = String(req.body.password || "");
    if ((!email && !id) || !password) {
      return res.status(400).json({
        success: false,
        message: "User identifier and new password are required.",
      });
    }

    const user = await User.findOneAndUpdate(
      email ? { authEmail: email } : { id },
      { $set: { authPassword: password } },
      { returnDocument: 'after' },
    );
    if (!user)
      return res
          .status(404)
          .json({ success: false, message: "User not found." });
    return res.json({
      success: true,
      message: "Password updated successfully!",
      data: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ── Forgot Password ────────────────────────────────────────────────────────
// In-memory OTP store: { email -> { otp, expiresAt } }
// (For production, replace with Redis or a DB field)
const otpStore = new Map();

const { sendEmail } = require('../utils/mailer');

/**
 * POST /auth/forgot-password/send-otp
 * Body: { email }
 * Generates a 6-digit OTP, stores it for 10 minutes, sends it via SMTP.
 */
router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ authEmail: email });
    if (!user) {
      // Return generic message to avoid email enumeration
      return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { otp, expiresAt });

    await sendEmail({
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
          <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#0284c7,#0369a1);padding:32px 24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Password Reset</h1>
              <p style="color:#bae6fd;margin:8px 0 0;font-size:14px;">Your one-time verification code</p>
            </div>
            <div style="padding:32px 24px;text-align:center;">
              <p style="color:#475569;font-size:15px;margin:0 0 24px;">Use this OTP to reset your password. It expires in <strong>10 minutes</strong>.</p>
              <div style="display:inline-block;background:#0284c7;color:#fff;font-size:36px;font-weight:800;letter-spacing:12px;padding:16px 32px;border-radius:12px;">${otp}</div>
              <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">If you did not request this, please ignore this email.</p>
            </div>
          </div>
        `,
    });

    return res.json({ success: true, message: 'OTP sent to your email address.' });
  } catch (error) {
    console.error('[ForgotPassword] send-otp error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});


router.post('/forgot-password/reset', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required.' });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP found for this email. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    
    const user = await User.findOneAndUpdate(
      { authEmail: email },
      { $set: { authPassword: newPassword } },
      { returnDocument: 'after' }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    otpStore.delete(email); // Clear OTP after successful reset
    return res.json({ success: true, message: 'Password reset successfully! You can now sign in.' });
  } catch (error) {
    console.error('[ForgotPassword] reset error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
  }
});

const signupOtpStore = new Map();


router.post('/signup/send-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ authEmail: email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'This email is already registered. Please sign in instead.' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    signupOtpStore.set(email, { otp, expiresAt });

    await sendEmail({
      to: email,
      subject: 'Verify Your Email - Shop Registration',
      html: `
          <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#0284c7,#0369a1);padding:32px 24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Verify Your Email</h1>
              <p style="color:#bae6fd;margin:8px 0 0;font-size:14px;">Your one-time verification code</p>
            </div>
            <div style="padding:32px 24px;text-align:center;">
              <p style="color:#475569;font-size:15px;margin:0 0 24px;">Use this OTP to verify your email address. It expires in <strong>10 minutes</strong>.</p>
              <div style="display:inline-block;background:#0284c7;color:#fff;font-size:36px;font-weight:800;letter-spacing:12px;padding:16px 32px;border-radius:12px;">${otp}</div>
              <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">If you did not request this, please ignore this email.</p>
            </div>
          </div>
        `,
    });

    return res.json({ success: true, message: 'OTP sent to your email address.' });
  } catch (error) {
    console.error('[Signup] send-otp error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});


router.post('/signup/verify-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const record = signupOtpStore.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP found for this email. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      signupOtpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // OTP verified — clear it
    signupOtpStore.delete(email);
    return res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('[Signup] verify-otp error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP. Please try again.' });
  }
});


router.get("/users-list", authenticateToken, async (req, res) => {
  try {
    const roleFilter = req.query.role;
    const filter = {};
    if (roleFilter) {
      filter.role = roleFilter;
    }
    const users = await User.find(filter);

    
    const { Detail } = require("../models/Detail");
    const productsGrouped = await Detail.aggregate([
      {
        $match: {
          productName: { $exists: true, $ne: "" },
          $or: [
            { username: { $exists: false } },
            { username: "" },
            { username: null }
          ]
        }
      },
      {
        $group: {
          _id: "$sellerId",
          productCount: { $sum: 1 },
          totalValue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$price", 0] },
                { $ifNull: ["$stock", 0] }
              ]
            }
          }
        }
      }
    ]);

    const statsMap = {};
    productsGrouped.forEach((item) => {
      if (item._id) {
        statsMap[item._id] = {
          count: item.productCount,
          value: item.totalValue || 0,
        };
      }
    });

    const publicUsers = users.map((u) => {
      const pubUser = publicUser(u);
      if (pubUser && pubUser.role === "Seller") {
        pubUser.productStats = statsMap[pubUser.id] || { count: 0, value: 0 };
      }
      return pubUser;
    });

    return res.json({ success: true, data: publicUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
