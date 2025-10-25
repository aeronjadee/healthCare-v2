"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    // Associations define relationships with other models (Users table)
    static associate(models) {
      // Each appointment belongs to ONE patient
      Appointment.belongsTo(models.User, {
        as: "patient",
        foreignKey: "patientId",
      });

      // Each appointment belongs to ONE doctor
      Appointment.belongsTo(models.User, {
        as: "doctor",
        foreignKey: "doctorId",
      });
    }
  }

  // Define the appointment schema
  Appointment.init(
    {
      // Appointment status (pending, confirmed, cancelled)
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
        defaultValue: "pending",
      },

      // Date of appointment (YYYY-MM-DD)
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      // Time of appointment (HH:MM:SS)
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },

      // Reason for booking the appointment (required from patient)
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Lab results (optional, can be provided by patient)
      labResults: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,          // Pass the database connection
      modelName: "Appointment", // Model name → Appointments table in DB
    }
  );

  return Appointment;
};
