"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import "@/styles/login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: username, 3: password reset
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    username: "",
    newPassword: "",
    confirmPassword: ""
  });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    try {
      const res = await api.post("auth/login", { email, password });
  
      if (res.data.success) {
        const { token, user } = res.data.data;
  
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
  
        setMessage("Login successful! Redirecting...");
  
        setTimeout(() => {
          if (user.role === "patient") {
            router.push("/patient/appointments/book");
          } else if (user.role === "doctor") {
            router.push("/doctor");
          } else if (user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }, 1500);
      } else {
        setMessage(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Invalid email or password. Please try again.");
    } finally { 
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    router.push("/auth/register");
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    try {
      const res = await api.post("auth/check-email", { email: forgotPasswordData.email });
      
      if (res.data.success) {
        setMessage(res.data.message);
        setForgotPasswordStep(2);
      } else {
        setMessage(res.data.message || "Failed to verify email");
      }
    } catch (error) {
      console.error("Check email error:", error);
      setMessage(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUsername = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    try {
      const res = await api.post("auth/verify-username", { 
        email: forgotPasswordData.email,
        username: forgotPasswordData.username 
      });
      
      if (res.data.success) {
        setMessage(res.data.message);
        setForgotPasswordStep(3);
      } else {
        setMessage(res.data.message || "Failed to verify username");
      }
    } catch (error) {
      console.error("Verify username error:", error);
      setMessage(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    // Check if passwords match
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    // Check password length
    if (forgotPasswordData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await api.post("auth/reset-password", { 
        email: forgotPasswordData.email,
        username: forgotPasswordData.username,
        newPassword: forgotPasswordData.newPassword
      });
      
      if (res.data.success) {
        setMessage(res.data.message);
        // Reset form and go back to login
        setForgotPasswordData({ email: "", username: "", newPassword: "", confirmPassword: "" });
        setForgotPasswordStep(1);
        setShowForgotPassword(false);
      } else {
        setMessage(res.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setMessage("");
    setForgotPasswordData({ email: "", username: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="health-icon">🏥</div>
          <h1 className="login-title">HealthCare Pro</h1>
          <p className="login-subtitle">
            {showForgotPassword ? "Reset your password" : "Sign in to your account"}
          </p>
        </div>

        {/* Login Form or Forgot Password Form */}
        {!showForgotPassword ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-input"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Message Display */}
            {message && (
              <div className={`message ${
                message.includes('successful') || message.includes('sent') || message.includes('verified') ? 'success' :
                message.includes('Invalid') || message.includes('failed') || message.includes('wrong') ? 'error' :
                message.includes('password') || message.includes('match') ? 'warning' :
                'info'
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {/* Forgot Password Link */}
            <div className="register-link">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="register-button"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        ) : (
                  <>
                    {/* Step 1: Email Verification */}
                    {forgotPasswordStep === 1 && (
                      <form onSubmit={handleCheckEmail}>
                        <div className="form-group">
                          <label htmlFor="forgot-email" className="form-label">
                            Email Address
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            id="forgot-email"
                            value={forgotPasswordData.email}
                            onChange={(e) => setForgotPasswordData({...forgotPasswordData, email: e.target.value})}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>

                        {/* Message Display */}
                        {message && (
                          <div className={`message ${
                            message.includes('verified') || message.includes('sent') ? 'success' :
                            message.includes('Invalid') || message.includes('failed') || message.includes('wrong') ? 'error' :
                            message.includes('password') || message.includes('match') ? 'warning' :
                            'info'
                          }`}>
                            {message}
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="login-button"
                          disabled={isLoading}
                        >
                          {isLoading ? "Verifying..." : "Verify Email"}
                        </button>

                        {/* Back to Login Link */}
                        <div className="register-link">
                          <button
                            type="button"
                            onClick={resetForgotPasswordFlow}
                            className="register-button"
                          >
                            Back to Login
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Step 2: Username Verification */}
                    {forgotPasswordStep === 2 && (
                      <form onSubmit={handleVerifyUsername}>
                        <div className="form-group">
                          <label htmlFor="forgot-username" className="form-label">
                            Username
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            id="forgot-username"
                            value={forgotPasswordData.username}
                            onChange={(e) => setForgotPasswordData({...forgotPasswordData, username: e.target.value})}
                            placeholder="Enter your username"
                            required
                          />
                        </div>

                        {/* Message Display */}
                        {message && (
                          <div className={`message ${
                            message.includes('verified') || message.includes('sent') ? 'success' :
                            message.includes('Invalid') || message.includes('failed') || message.includes('wrong') ? 'error' :
                            message.includes('password') || message.includes('match') ? 'warning' :
                            'info'
                          }`}>
                            {message}
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="login-button"
                          disabled={isLoading}
                        >
                          {isLoading ? "Verifying..." : "Verify Username"}
                        </button>

                        {/* Back to Login Link */}
                        <div className="register-link">
                          <button
                            type="button"
                            onClick={resetForgotPasswordFlow}
                            className="register-button"
                          >
                            Back to Login
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Step 3: Password Reset */}
                    {forgotPasswordStep === 3 && (
                      <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                          <label htmlFor="new-password" className="form-label">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="form-input"
                            id="new-password"
                            value={forgotPasswordData.newPassword}
                            onChange={(e) => setForgotPasswordData({...forgotPasswordData, newPassword: e.target.value})}
                            placeholder="Enter your new password"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="confirm-password" className="form-label">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="form-input"
                            id="confirm-password"
                            value={forgotPasswordData.confirmPassword}
                            onChange={(e) => setForgotPasswordData({...forgotPasswordData, confirmPassword: e.target.value})}
                            placeholder="Confirm your new password"
                            required
                          />
                        </div>

                        {/* Message Display */}
                        {message && (
                          <div className={`message ${
                            message.includes('successfully') || message.includes('sent') || message.includes('verified') ? 'success' :
                            message.includes('Invalid') || message.includes('failed') || message.includes('wrong') ? 'error' :
                            message.includes('password') || message.includes('match') ? 'warning' :
                            'info'
                          }`}>
                            {message}
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="login-button"
                          disabled={isLoading}
                        >
                          {isLoading ? "Resetting..." : "Reset Password"}
                        </button>

                        {/* Back to Login Link */}
                        <div className="register-link">
                          <button
                            type="button"
                            onClick={resetForgotPasswordFlow}
                            className="register-button"
                          >
                            Back to Login
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

        {/* Register Link */}
        {!showForgotPassword && (
          <div className="register-link">
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={goToRegister}
                className="register-button"
              >
                Create Account
              </button>
            </p>
          </div>
        )}


      </div>
    </div>
  );
}
