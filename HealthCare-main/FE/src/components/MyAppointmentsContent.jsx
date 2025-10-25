"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import "@/styles/bookAppointment.css";

export default function MyAppointmentsContent() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch patient's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("appointments/mine");
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setMessage("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (e) {}
    router.push("/auth/login");
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Appointments</h1>
        <button className="button" onClick={handleLogout}>Logout</button>
      </div>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Lab Results</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>
                  {appt.doctor?.username} ({appt.doctor?.email})
                </td>
                <td>{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.reason}</td>
                <td>
                  {appt.labResults ? (
                    <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                      {appt.labResults.length > 100 
                        ? `${appt.labResults.substring(0, 100)}...` 
                        : appt.labResults}
                    </div>
                  ) : (
                    <span style={{ color: '#666', fontStyle: 'italic' }}>No lab results</span>
                  )}
                </td>
                <td>
                  <span className={`status-${appt.status?.toLowerCase() || 'pending'}`}>
                    {typeof appt.status === 'string' ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : appt.status}
                  </span>
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

