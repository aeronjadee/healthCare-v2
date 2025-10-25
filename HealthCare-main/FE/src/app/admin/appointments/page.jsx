"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("admin/appointments");
        if (res.data.success) setAppointments(res.data.data);
      } catch (error) {
        console.error("Appointments fetch error:", error);
      }
    };
    fetchAppointments();
  }, []);

  const handleConfirmAppointment = async (id) => {
    try {
      const res = await api.put(`admin/appointments/${id}/confirm`);
      if (res.data.success) {
        setMessage("Appointment confirmed!");
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a))
        );
      }
    } catch (error) {
      console.error("Confirm error:", error);
      setMessage("Error confirming appointment.");
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await api.put(`admin/appointments/${id}/cancel`);
      if (res.data.success) {
        setMessage("Appointment cancelled!");
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
        );
      }
    } catch (error) {
      console.error("Cancel error:", error);
      setMessage("Error cancelling appointment.");
    }
  };

  return (
    <div className="container">
      <h1>Appointments</h1>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Lab Results</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.patient?.username}</td>
                <td>{a.doctor?.username}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <span className={`status-${a.status?.toLowerCase() || 'pending'}`}>
                    {a.status?.charAt(0).toUpperCase() + a.status?.slice(1) || 'Pending'}
                  </span>
                </td>
                <td>{a.reason}</td>
                <td>
                  {a.labResults ? (
                    <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                      {a.labResults.length > 100
                        ? `${a.labResults.substring(0, 100)}...`
                        : a.labResults}
                    </div>
                  ) : (
                    <span style={{ color: '#666', fontStyle: 'italic' }}>No lab results</span>
                  )}
                </td>
                <td>
                  {a.status === "pending" && (
                    <>
                      <button className="button confirm" onClick={() => handleConfirmAppointment(a.id)}>Confirm</button>
                      <button className="button delete" onClick={() => handleCancelAppointment(a.id)}>Cancel</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}


