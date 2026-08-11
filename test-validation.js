const Joi = require("joi");

// Test the validation schemas
const emailSchema = Joi.string()
  .email({ tlds: { allow: ["com"] } })
  .required()
  .messages({
    "string.email": "Please provide a valid email address ending with .com",
    "any.required": "Email is required",
    "string.empty": "Email is required",
  });

const passwordSchema = Joi.string()
  .pattern(/^(?=.*[A-Z])(?=.*[a-z].*[a-z].*[a-z].*[a-z].*[a-z].*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least 1 capital letter, 6 lowercase letters, 1 digit, and 1 special symbol",
    "any.required": "Password is required",
    "string.empty": "Password is required",
  });

// Test cases
console.log("Testing email validation:");
const emailTests = [
  "test@example.com",     // Valid
  "test@example.org",     // Invalid - not .com
  "invalid-email",        // Invalid
  "test@.com",            // Invalid
  "",                     // Invalid - empty
];

emailTests.forEach(email => {
  const result = emailSchema.validate(email);
  console.log(`${email}: ${result.error ? "INVALID - " + result.error.message : "VALID"}`);
});

console.log("\nTesting password validation:");
const passwordTests = [
  "Password1!",           // Valid - 1 cap, 6+ lower, 1 digit, 1 special
  "password1!",           // Invalid - no capital
  "PASSWORD1!",           // Invalid - no lowercase
  "Password!",            // Invalid - no digit
  "Password1",            // Invalid - no special char
  "Pass1!",               // Invalid - not enough lowercase (only 3)
  "Password123!",         // Valid
  "",                     // Invalid - empty
];

passwordTests.forEach(password => {
  const result = passwordSchema.validate(password);
  console.log(`${password}: ${result.error ? "INVALID - " + result.error.message : "VALID"}`);
});

console.log("\nTesting signup schema:");
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

const signupTests = [
  { name: "John Doe", email: "john@example.com", password: "Password1!" },  // Valid
  { name: "J", email: "john@example.com", password: "Password1!" },          // Invalid - name too short
  { name: "John Doe", email: "john@example.org", password: "Password1!" },   // Invalid - email not .com
  { name: "John Doe", email: "john@example.com", password: "password1!" },   // Invalid - password no capital
];

signupTests.forEach((test, index) => {
  const result = signupSchema.validate(test);
  console.log(`Test ${index + 1}: ${result.error ? "INVALID - " + result.error.details.map(d => d.message).join(", ") : "VALID"}`);
});