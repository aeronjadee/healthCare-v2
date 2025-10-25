"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import "@/styles/doctor.css";

export default function DoctorPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [labDraft, setLabDraft] = useState("");

  const formatStatus = (s) => {
    if (!s || typeof s !== "string") return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // ✅ Fetch doctor appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("doctors/appointments");
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // ✅ Cancel appointment
  const handleCancel = async (appointmentId) => {
    try {
      const res = await api.put(`doctors/appointments/${appointmentId}/cancel`);

      if (res.data.success) {
        setMessage("Appointment cancelled successfully!");
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === appointmentId
              ? { ...appt, status: "cancelled" }
              : appt
          )
        );
      } else {
        setMessage(res.data.message || "Failed to cancel appointment.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      setMessage("Something went wrong while cancelling.");
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    router.push("/auth/login");
  };

  const startEditLab = (appt) => {
    setEditingId(appt.id);
    setLabDraft(appt.labResults || "");
  };

  const cancelEditLab = () => {
    setEditingId(null);
    setLabDraft("");
  };

  const saveLabResults = async (id) => {
    try {
      const res = await api.put(`doctors/appointments/${id}/lab-results`, { labResults: labDraft });
      if (res.data.success) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, labResults: labDraft } : a)));
        setMessage("Lab results saved.");
        setEditingId(null);
        setLabDraft("");
      }
    } catch (error) {
      console.error("Save lab results error:", error);
      setMessage("Error saving lab results.");
    }
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Doctor Dashboard</h1>
        <button className="button" onClick={handleLogout}>Logout</button>
      </div>
      <h2>My Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Lab Results</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>
                  {appt.patient?.username} ({appt.patient?.email})
                </td>
                <td>{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.reason}</td>
                <td>
                  {editingId === appt.id ? (
                    <div>
                      <textarea
                        value={labDraft}
                        onChange={(e) => setLabDraft(e.target.value)}
                        style={{ width: '100%', minWidth: 260, minHeight: 90 }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="button" onClick={() => saveLabResults(appt.id)}>Save</button>
                        <button className="button delete" type="button" onClick={cancelEditLab}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ maxWidth: '260px', wordWrap: 'break-word' }}>
                      {appt.labResults ? (
                        appt.labResults.length > 100 ? `${appt.labResults.substring(0, 100)}...` : appt.labResults
                      ) : (
                        <span style={{ color: '#666', fontStyle: 'italic' }}>No lab results</span>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`status-${appt.status?.toLowerCase() || 'pending'}`}>
                    {formatStatus(appt.status)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="button" type="button" onClick={() => startEditLab(appt)}>
                      {editingId === appt.id ? 'Editing...' : (appt.labResults ? 'Edit Lab' : 'Add Lab')}
                    </button>
                    <button
                      className="button cancel"
                      disabled={appt.status === "cancelled"}
                      onClick={() => handleCancel(appt.id)}
                      type="button"
                    >
                      Cancel Appointment
                    </button>
                  </div>
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
