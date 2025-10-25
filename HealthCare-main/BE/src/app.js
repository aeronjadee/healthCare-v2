/**
* Express Application Setup
* -------------------------
* This file initializes the Express.js application with security, logging,
* body parsing, routing, and error handling middleware.
*
* Key Features:
* - Helmet: Adds security-related HTTP headers
* - CORS: Allows cross-origin requests from frontend
* - Morgan: Logs HTTP requests
* - Routes: Auth, Admin, and Appointment endpoints
* - Health Check endpoint
* - 404 handling
* - Global error handler
*/

const express = require("express"); 
const cors = require("cors"); 
const helmet = require("helmet"); 
const morgan = require("morgan"); 
require("dotenv").config(); 

// Import route files
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes"); // ✅ Appointment routes
const doctorRoutes = require("./routes/doctorRoutes"); // ✅ Doctor routes


// Import database models
const db = require("./models");

const app = express(); 

// ---------------------- Middleware Setup ----------------------

app.use(helmet()); 

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ important
  }),
);

app.use(morgan("combined")); 
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true })); 

// ---------------------- Routes ----------------------

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Appointment routes (patient booking & viewing)
app.use("/api/appointments", appointmentRoutes); // ✅ Registered here

// Doctor routes (doctor-specific actions)
app.use("/api/doctors", doctorRoutes); // ✅ Registered here


// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------- Error Handling ----------------------

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
});

module.exports = app;
