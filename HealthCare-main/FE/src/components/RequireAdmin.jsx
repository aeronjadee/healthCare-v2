"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";


/**
 * ✅ RequireAdmin
 * ----------------
 * Frontend route guard for protecting admin-only pages.
 *
 * - Checks if a JWT exists in localStorage
 * - Verifies expiration and role = "admin"
 * - Redirects unauthorized users to /unauthorized or /auth/login
 *
 * Usage:
 *   <RequireAdmin>
 *     <AdminPageContent />
 *   </RequireAdmin>
 */
export default function RequireAdmin({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // ✅ check expiration
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        router.push("/auth/login");
        return;
      }

      // ✅ check role
      if (decoded.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error("RequireAdmin decode error:", error);
      router.push("/auth/login");
    }
  }, [router]);

  // Show nothing until role is verified
  return authorized ? children : null;
}
