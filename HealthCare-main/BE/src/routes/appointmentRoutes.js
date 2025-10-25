const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");
const { authenticateToken } = require("../middleware/auth");
const { requirePatient } = require("../middleware/rbac"); // 👈 import predefined

/**
 * Patient Appointment Routes
 * ----------------------------------------------------
 * - Patients can book new appointments
 * - Patients can view their own appointments
 */
// Patient books a new appointment
router.post("/", authenticateToken, requirePatient, appointmentController.bookAppointment);

// Patient views their own appointments
router.get("/mine", authenticateToken, requirePatient, appointmentController.getMyAppointments);

module.exports = router;
