const Joi = require("joi");

// Email validation - only .com domains allowed
const emailSchema = Joi.string()
  .email({ tlds: { allow: ["com"] } })
  .required()
  .messages({
    "string.email": "Please provide a valid email address ending with .com",
    "any.required": "Email is required",
    "string.empty": "Email is required",
  });

// Password validation - at least 1 capital letter, minimum 6 alphabets, 1 special symbol, 1 digit
const passwordSchema = Joi.string()
  .pattern(/^(?=.*[A-Z])(?=.*[a-z].*[a-z].*[a-z].*[a-z].*[a-z].*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least 1 capital letter, 6 lowercase letters, 1 digit, and 1 special symbol",
    "any.required": "Password is required",
    "string.empty": "Password is required",
  });

// Signup validation schema
const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
    "string.empty": "Name is required",
  }),
  email: emailSchema,
  password: passwordSchema,
  role: Joi.string().valid("Buyer", "Seller", "Admin").optional(),
});

// Login validation schema — no password pattern enforcement here;
// the DB bcrypt compare handles credential correctness.
const loginEmailSchema = Joi.string().email({ tlds: { allow: false } }).required().messages({
  "string.email": "Please provide a valid email address",
  "any.required": "Email is required",
  "string.empty": "Email is required",
});

const loginSchema = Joi.object({
  email: loginEmailSchema,
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
  }),
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  email: emailSchema,
  id: Joi.string().optional(),
  password: passwordSchema,
}).or("email", "id");

// Forgot password send OTP validation
const forgotPasswordSendOtpSchema = Joi.object({
  email: emailSchema,
});

// Forgot password reset validation
const forgotPasswordResetSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be 6 digits",
    "string.pattern.base": "OTP must contain only digits",
    "any.required": "OTP is required",
    "string.empty": "OTP is required",
  }),
  newPassword: passwordSchema,
});

// Signup send OTP validation
const signupSendOtpSchema = Joi.object({
  email: emailSchema,
});

// Signup verify OTP validation
const signupVerifyOtpSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be 6 digits",
    "string.pattern.base": "OTP must contain only digits",
    "any.required": "OTP is required",
    "string.empty": "OTP is required",
  }),
});

// Profile update validation
const profileUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
  }),
  authEmail: emailSchema.optional(),
});

// Middleware factory function
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSendOtpSchema,
  forgotPasswordResetSchema,
  signupSendOtpSchema,
  signupVerifyOtpSchema,
  profileUpdateSchema,
};