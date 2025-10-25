const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
* Utility: Generate JWT token for a user
* ----------------------------------------------------
* - Encodes user ID, email, and role into the token
* - Uses a secret key (JWT_SECRET) from environment variables
* - Default expiration = 7 days (can be overridden with JWT_EXPIRES_IN)
*
* @param {Object} user - User instance
* @returns {string} JWT token
*/
const generateToken = (user) => {
 return jwt.sign(
   {
     userId: user.id,
     email: user.email,
     role: user.role,
   },
   process.env.JWT_SECRET,
   {
     expiresIn: process.env.JWT_EXPIRES_IN || "7d",
   },
 );
};

/**
* Controller: Register a new user
* ----------------------------------------------------
* - Validates input (username, email, password required)
* - Hashing is handled by Sequelize model hook
* - Creates user and generates JWT for immediate login
*
* @route POST /api/auth/register
* @access Public
*/
const register = async (req, res) => {
 try {
   const { username, email, password, role } = req.body;

   // Validate required fields
   if (!username || !email || !password) {
     return res.status(400).json({
       success: false,
       message: "Username, email, and password are required",
     });
   }

   // Create new user in database
   // Role defaults to "patient" if not provided
   const user = await User.create({
     username,
     email,
     password,
     role: role || "patient",
   });

   // Generate token for new user
   const token = generateToken(user);

   res.status(201).json({
     success: true,
     message: "User registered successfully",
     data: {
       user: user.toJSON(), // Removes password automatically
       token,
     },
   });
 } catch (error) {
   console.error("Registration error:", error);

   // Handle validation errors (e.g. invalid email format)
   if (error.name === "SequelizeValidationError") {
     const messages = error.errors.map((err) => err.message);
     return res.status(400).json({
       success: false,
       message: "Validation failed",
       errors: messages,
     });
   }

   // Handle duplicate username/email
   if (error.name === "SequelizeUniqueConstraintError") {
     const field = error.errors[0].path;
     return res.status(400).json({
       success: false,
       message: `${field} already exists`,
     });
   }

   // Generic server error
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

/**
* Controller: Login user
* ----------------------------------------------------
* - Validates input (email + password required)
* - Finds user by email
* - Validates password with bcrypt
* - Returns JWT token on success
*
* @route POST /api/auth/login
* @access Public
*/
const login = async (req, res) => {
 try {
   const { email, password } = req.body;

   // Check if required fields are provided
   if (!email || !password) {
     return res.status(400).json({
       success: false,
       message: "Email and password are required",
     });
   }

   // Find user by email (include password for validation)
   const user = await User.findOne({
     where: { email },
     attributes: [
       "id",
       "username",
       "email",
       "password",
       "role",
       "createdAt",
       "updatedAt",
     ],
   });

   if (!user) {
     return res.status(401).json({
       success: false,
       message: "Invalid email or password",
     });
   }

   // Validate password using instance method
   const isValidPassword = await user.validatePassword(password);
   if (!isValidPassword) {
     return res.status(401).json({
       success: false,
       message: "Invalid email or password",
     });
   }

   // Generate JWT token
   const token = generateToken(user);

   res.json({
     success: true,
     message: "Login successful",
     data: {
       user: user.toJSON(), // Removes password automatically
       token,
     },
   });
 } catch (error) {
   console.error("Login error:", error);
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

/**
* Controller: Check Email for Password Reset
* ----------------------------------------------------
* - Validates email exists in database
* - Returns success if email found (for demo purposes)
*
* @route POST /api/auth/check-email
* @access Public
*/
const checkEmail = async (req, res) => {
 try {
   const { email } = req.body;

   // Check if email is provided
   if (!email) {
     return res.status(400).json({
       success: false,
       message: "Email is required",
     });
   }

   // Find user by email
   const user = await User.findOne({
     where: { email },
     attributes: ['id', 'email'] // Only return non-sensitive data
   });

   if (!user) {
     return res.status(404).json({
       success: false,
       message: "No account found with this email address",
     });
   }

   res.json({
     success: true,
     message: "Email verified. Please enter your username.",
   });
 } catch (error) {
   console.error("Check email error:", error);
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

/**
* Controller: Verify Username for Password Reset
* ----------------------------------------------------
* - Validates username matches the email
* - Returns success if both match
*
* @route POST /api/auth/verify-username
* @access Public
*/
const verifyUsername = async (req, res) => {
 try {
   const { email, username } = req.body;

   // Check if required fields are provided
   if (!email || !username) {
     return res.status(400).json({
       success: false,
       message: "Email and username are required",
     });
   }

   // Find user by email and username
   const user = await User.findOne({
     where: { 
       email,
       username 
     },
   });

   if (!user) {
     return res.status(404).json({
       success: false,
       message: "Username does not match the provided email",
     });
   }

   res.json({
     success: true,
     message: "Username verified. You can now reset your password.",
   });
 } catch (error) {
   console.error("Verify username error:", error);
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

/**
* Controller: Reset Password
* ----------------------------------------------------
* - Updates user's password after email and username verification
*
* @route POST /api/auth/reset-password
* @access Public
*/
const resetPassword = async (req, res) => {
 try {
   const { email, username, newPassword } = req.body;

   // Check if required fields are provided
   if (!email || !username || !newPassword) {
     return res.status(400).json({
       success: false,
       message: "Email, username, and new password are required",
     });
   }

   // Find user by email and username
   const user = await User.findOne({
     where: { 
       email,
       username 
     },
   });

   if (!user) {
     return res.status(404).json({
       success: false,
       message: "Invalid credentials",
     });
   }

   // Update the password (bcrypt will hash it automatically due to model hooks)
   await user.update({ password: newPassword });

   res.json({
     success: true,
     message: "Password has been reset successfully. You can now login with your new password.",
   });
 } catch (error) {
   console.error("Reset password error:", error);
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

/**
* Controller: Get Current User Profile
* ----------------------------------------------------
* - Uses `authenticateToken` middleware to set req.user
* - Returns the logged-in user's data (no password)
*
* @route GET /api/auth/profile
* @access Private
*/
const getProfile = async (req, res) => {
 try {
   res.json({
     success: true,
     data: {
       user: req.user.toJSON(),
     },
   });
 } catch (error) {
   console.error("Get profile error:", error);
   res.status(500).json({
     success: false,
     message: "Internal server error",
   });
 }
};

module.exports = {
 register,
 login,
 checkEmail,
 verifyUsername,
 resetPassword,
 getProfile,
};