"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import "@/styles/bookAppointment.css";

export default function PatientPageContent() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Fetch doctors when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("doctors"); // calls GET /api/doctors
        if (res.data.success) {
          setDoctors(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("appointments", {
        doctorId,
        date,
        time,
        reason,
      });

      if (res.data.success) {
        setMessage("Appointment booked successfully!");
        setDoctorId("");
        setDate("");
        setTime("");
        setReason("");
      } else {
        setMessage(res.data.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Book appointment error:", error);
      setMessage("Something went wrong");
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    router.push("/auth/login");
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Book Appointment</h1>
        <button className="button" onClick={handleLogout}>Logout</button>
      </div>
      <form onSubmit={handleSubmit}>
        {/* ✅ Doctor dropdown */}
        <div className="form-group">
          <label className="label">Choose Doctor:</label>
          <select
            className="select"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
          >
            <option value="">-- Select a Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.username} ({doc.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Date:</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Time:</label>
          <input
            className="input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Reason:</label>
          <input
            className="input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <button className="button" type="submit">
          Book Appointment
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}


