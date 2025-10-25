"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {
    // Insert demo appointments
    await queryInterface.bulkInsert("Appointments", [
      {
        id: uuidv4(),
        patientId: "adf48285-b042-483e-8bb4-1297a0384118",   // replace with actual patient UUID from Users seeder
        doctorId: "93f45093-07d4-48e0-b2b1-0a9e079a3e33",     // replace with actual doctor UUID
        status: "pending",                // appointment awaiting admin confirmation
        date: "2025-09-25",
        time: "10:00:00",
        reason: "General check-up",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        patientId: "adf48285-b042-483e-8bb4-1297a0384118",   // replace with actual patient UUID from Users seeder
        doctorId: "93f45093-07d4-48e0-b2b1-0a9e079a3e33",     // replace with actual doctor UUID
        status: "confirmed",
        date: "2025-09-26",
        time: "14:30:00",
        reason: "Back pain consultation",
        notes: "Follow-up requested by admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        patientId: "adf48285-b042-483e-8bb4-1297a0384118",
        doctorId: "93f45093-07d4-48e0-b2b1-0a9e079a3e33",
        status: "cancelled",
        date: "2025-09-27",
        time: "09:00:00",
        reason: "Flu symptoms",
        notes: "Cancelled due to scheduling conflict",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    // Delete all demo appointments
    await queryInterface.bulkDelete("Appointments", null, {});
  },
};
