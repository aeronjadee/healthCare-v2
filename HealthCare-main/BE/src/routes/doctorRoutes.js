const express = require("express");
const { getMyAppointments, cancelAppointment, updateLabResults } = require("../controllers/doctorController");
const { authenticateToken } = require("../middleware/auth");
const { requireDoctor } = require("../middleware/rbac");
const { User } = require("../models");

const router = express.Router();

// ---------------------- Routes ----------------------

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors (for patients to choose when booking)
 * @access  Private (Any logged-in user)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: "doctor" },
      attributes: ["id", "username", "email"], // only safe fields
    });
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------------- Doctor-Only Routes ----------------------

// Apply doctor-only access to the following routes
router.use(authenticateToken);
router.use(requireDoctor);

/**
 * @route   GET /api/doctors/appointments
 * @desc    Retrieve all appointments assigned to the logged-in doctor
 * @access  Private (Doctor only)
 */
router.get("/appointments", getMyAppointments);

/**
 * @route   PUT /api/doctors/appointments/:id/cancel
 * @desc    Cancel an appointment assigned to the logged-in doctor
 * @param   {string} id - The ID of the appointment
 * @access  Private (Doctor only)
 */
router.put("/appointments/:id/cancel", cancelAppointment);

/**
 * @route   PUT /api/doctors/appointments/:id/lab-results
 * @desc    Update lab results for an appointment assigned to the logged-in doctor
 * @access  Private (Doctor only)
 */
router.put("/appointments/:id/lab-results", updateLabResults);

// ---------------------- Export ----------------------
module.exports = router;
