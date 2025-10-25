"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import "@/styles/admin.css";

export default function AdminPageContent() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "patient",
  });

  // ✅ Fetch dashboard, users, appointments
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("admin/dashboard");
        if (res.data.success) setStats(res.data.data.statistics);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await api.get("admin/users");
        if (res.data.success) setUsers(res.data.data.users);
      } catch (error) {
        console.error("Users fetch error:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await api.get("admin/appointments");
        if (res.data.success) setAppointments(res.data.data);
      } catch (error) {
        console.error("Appointments fetch error:", error);
      }
    };

    fetchDashboard();
    fetchUsers();
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (error) {}
    router.push("/auth/login");
  };

  // ✅ Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("admin/users", newUser);
      if (res.data.success) {
        setMessage("User created successfully!");
        setUsers((prev) => [res.data.data, ...prev]);
        setNewUser({ username: "", email: "", password: "", role: "patient" });
      } else {
        setMessage(res.data.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Create user error:", error);
      setMessage("Something went wrong while creating user.");
    }
  };

  // ✅ Delete user
  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await api.delete(`admin/users/${userId}`);
      if (res.data.success) {
        setMessage("User deleted successfully!");
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        setMessage(res.data.message || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      setMessage("Something went wrong while deleting.");
    }
  };

  // ✅ Confirm appointment
  const handleConfirmAppointment = async (id) => {
    try {
      const res = await api.put(`admin/appointments/${id}/confirm`);
      if (res.data.success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id)); // ✅ remove from table
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

  // ✅ Cancel appointment
  const handleCancelAppointment = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await api.put(`admin/appointments/${id}/cancel`);
      if (res.data.success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id)); // ✅ remove from table
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin Account</h1>
        <button className="button" onClick={handleLogout}>Logout</button>
      </div>

      {/* ✅ Stats */}
      {stats ? (
        <div className="stats">
          <p>Total Users: {stats.totalUsers}</p>
          <p>Admins: {stats.adminCount}</p>
          <p>Doctors: {stats.doctorCount}</p>
          <p>Patients: {stats.patientCount}</p>
        </div>
      ) : (
        <p>Loading statistics...</p>
      )}

      {/* ✅ Create User Form */}
      <h2>Create User (Doctor / Patient)</h2>
      <form onSubmit={handleCreateUser} className="form">
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        <button className="button" type="submit">Create</button>
      </form>

      {/* ✅ User Management */}
      <h2>User Management</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="button delete"
                    onClick={() => handleDelete(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Appointments have been moved to /admin/appointments */}

      {message && <p className="message">{message}</p>}
    </div>
  );
}
