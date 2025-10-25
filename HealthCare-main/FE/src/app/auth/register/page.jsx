"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import "@/styles/register.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      if (res.data.success) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => router.push("/auth/login"), 1500); // ✅ redirect after register
      } else {
        setMessage(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Username:</label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Email:</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Password:</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="button" type="submit">
          Register
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
